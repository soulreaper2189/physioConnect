import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { patientService } from '../services/api';
import { Activity, LogOut, CheckCircle, TrendingUp, Dumbbell, Calendar as CalendarIcon, FileHeart, Stethoscope } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

const PatientDashboard = () => {
    const { user, logout } = useAuth();
    const [exercises, setExercises] = useState([]);
    const [progressHistory, setProgressHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    // Doctor Link State
    const [hasDoctor, setHasDoctor] = useState(!!user.doctor_id);
    const [doctorCode, setDoctorCode] = useState('');
    const [isLinking, setIsLinking] = useState(false);

    // Form State for new log
    const [sessionDate, setSessionDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [painLevel, setPainLevel] = useState(5);
    const [mobilityNotes, setMobilityNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (hasDoctor) {
            fetchDashboardData();
        } else {
            setLoading(false);
        }
    }, [hasDoctor]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [exercisesData, progressData] = await Promise.all([
                patientService.getAssignedExercises(user.id),
                patientService.getProgressHistory(user.id)
            ]);

            setExercises(exercisesData.exercises || []);

            // Map data for chart
            const formattedProgress = (progressData.logs || []).map(log => ({
                ...log,
                displayDate: format(new Date(log.session_date), 'MMM dd')
            })).reverse(); // Reverse so chronological order is left to right

            setProgressHistory(formattedProgress);
        } catch (error) {
            console.error('Failed to fetch patient data:', error);
            showNotification('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleLinkDoctor = async (e) => {
        e.preventDefault();
        setIsLinking(true);
        try {
            await patientService.linkDoctor(user.id, doctorCode);
            showNotification('Successfully linked to your doctor!');

            // Show dashboard and trigger fetch via useEffect
            setHasDoctor(true);

            // Optional: update local storage user object to persist this
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser) {
                storedUser.doctor_id = true; // Just setting truthy to survive reloads
                localStorage.setItem('user', JSON.stringify(storedUser));
            }

        } catch (error) {
            console.error('Failed to link doctor:', error);
            showNotification(error.response?.data?.message || 'Invalid Doctor Code', 'error');
        } finally {
            setIsLinking(false);
        }
    };

    const handleToggleExercise = async (exerciseId, currentStatus) => {
        try {
            const newStatus = !currentStatus;

            // Optimistic update
            setExercises(prev => prev.map(ex =>
                ex.id === exerciseId ? { ...ex, is_completed_today: newStatus } : ex
            ));

            await patientService.toggleExerciseCompletion(exerciseId, newStatus);

            if (newStatus) {
                showNotification('Great job! One step closer.', 'success');
            }
        } catch (error) {
            console.error('Failed to update exercise:', error);
            showNotification('Failed to update status', 'error');
            // Revert on failure
            fetchDashboardData();
        }
    };

    const completedCount = exercises.filter(e => e.is_completed_today).length;
    const totalCount = exercises.length;
    const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const pieData = [
        { name: 'Completed', value: completedCount },
        { name: 'Remaining', value: totalCount - completedCount }
    ];
    const COLORS = ['#4F46E5', '#E2E8F0']; // brand-accent, brand-border

    const handleLogSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await patientService.logProgress({
                patient_id: user.id,
                session_date: sessionDate,
                pain_level: parseInt(painLevel),
                mobility_notes: mobilityNotes
            });

            showNotification('Progress logged successfully!');

            // Reset form (keep date)
            setPainLevel(5);
            setMobilityNotes('');

            // Refresh data
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to log progress:', error);
            showNotification(error.response?.data?.message || 'Failed to log progress', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <span className="ml-3 text-xl font-bold text-slate-900 tracking-tight block max-sm:hidden">Patient Portal</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-slate-500 font-medium max-sm:text-sm">Hello, {user.first_name}</span>
                        <button
                            onClick={logout}
                            className="flex items-center text-slate-500 hover:text-red-700 transition-colors bg-slate-50 p-2 rounded-full"
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-20 right-4 sm:right-8 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 transition-all duration-300 transform translate-y-0 opacity-100 ${notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                    }`}>
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">{notification.message}</span>
                </div>
            )}

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : !hasDoctor ? (
                    <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                        <div className="bg-indigo-600 p-6 text-white text-center">
                            <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-90" />
                            <h2 className="text-2xl font-bold">Link Your Doctor</h2>
                            <p className="text-slate-900 mt-2 opacity-90">Enter your doctor's unique code to begin therapy.</p>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleLinkDoctor} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-900 mb-1 text-center">Doctor's 8-Character Code</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. A1B2C3D4"
                                        value={doctorCode}
                                        onChange={(e) => setDoctorCode(e.target.value.toUpperCase())}
                                        className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg shadow-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center text-xl font-mono uppercase tracking-widest"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLinking || doctorCode.length < 8}
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-600-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${isLinking || doctorCode.length < 8 ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isLinking ? 'Verifying Code...' : 'Connect to Doctor'}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

                        {/* Left Column: Log Progress Form */}
                        <div className="lg:col-span-1 space-y-6 sm:space-y-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="bg-slate-50 p-4 sm:p-5 text-slate-900 border-b border-slate-200">
                                    <h2 className="text-lg font-bold flex items-center">
                                        <FileHeart className="h-5 w-5 mr-2 text-indigo-600" />
                                        Log Your Session
                                    </h2>
                                    <p className="text-slate-500 text-sm mt-1 opacity-90">Track your daily therapy progress</p>
                                </div>

                                <div className="p-5 sm:p-6">
                                    <form onSubmit={handleLogSubmit} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-900 mb-1">
                                                Session Date
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <CalendarIcon className="h-4 w-4 text-slate-500" />
                                                </div>
                                                <input
                                                    type="date"
                                                    required
                                                    value={sessionDate}
                                                    onChange={(e) => setSessionDate(e.target.value)}
                                                    max={format(new Date(), 'yyyy-MM-dd')}
                                                    className="pl-10 appearance-none block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-sm font-medium text-slate-900">
                                                    Pain Level (0-10)
                                                </label>
                                                <span className={`font-bold ${painLevel > 7 ? 'text-red-700' : painLevel > 4 ? 'text-yellow-700' : 'text-green-700'
                                                    }`}>{painLevel}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="10"
                                                value={painLevel}
                                                onChange={(e) => setPainLevel(e.target.value)}
                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                <span>0 - No Pain</span>
                                                <span>10 - Severe</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-900 mb-1">
                                                Mobility Notes
                                            </label>
                                            <textarea
                                                rows="3"
                                                placeholder="How did the exercises feel today? Any stiffness?"
                                                value={mobilityNotes}
                                                onChange={(e) => setMobilityNotes(e.target.value)}
                                                className="appearance-none block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md shadow-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-600-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            {isSubmitting ? 'Saving...' : 'Save Progress'}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Assigned Exercises List */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                                <div className="p-4 sm:p-5 border-b border-slate-200 flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center">
                                        <Dumbbell className="h-5 w-5 mr-2 text-indigo-600" />
                                        Today's Tasks
                                    </h2>
                                    <span className="text-xs font-semibold bg-blue-100 text-slate-500 px-2 py-1 rounded-full border border-indigo-300">
                                        {completedCount}/{totalCount} Done
                                    </span>
                                </div>

                                {totalCount > 0 && (
                                    <div className="flex items-center justify-center py-6 border-b border-slate-200 relative bg-slate-50/50">
                                        <div className="h-32 w-32 relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={pieData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={40}
                                                        outerRadius={55}
                                                        startAngle={90}
                                                        endAngle={-270}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        {pieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span className="text-xl font-bold text-slate-900">{completionPercentage}%</span>
                                                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Done</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 bg-slate-50/50 flex-1 overflow-y-auto min-h-[200px] max-h-[300px]">
                                    {exercises.length === 0 ? (
                                        <div className="text-center py-6 text-slate-500">
                                            <p className="font-medium">No exercises assigned yet.</p>
                                            <p className="text-sm mt-1">Your doctor will prescribe your routine.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {exercises.map((exercise) => (
                                                <div
                                                    key={exercise.id}
                                                    onClick={() => handleToggleExercise(exercise.id, exercise.is_completed_today)}
                                                    className={`p-3 rounded-lg border flex items-center cursor-pointer transition-all duration-200 ${exercise.is_completed_today
                                                        ? 'bg-white border-indigo-500 shadow-none'
                                                        : 'bg-slate-50 border-slate-200 hover:border-indigo-400 hover:shadow-md'
                                                        }`}
                                                >
                                                    <div className={`h-6 w-6 rounded-full border flex items-center justify-center mr-3 transition-colors ${exercise.is_completed_today
                                                        ? 'bg-indigo-600 border-indigo-500'
                                                        : 'border-slate-200 bg-slate-50'
                                                        }`}>
                                                        {exercise.is_completed_today && <CheckCircle className="h-4 w-4 text-white" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className={`font-medium ${exercise.is_completed_today ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                                            {exercise.exercise_name}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Chart and History */}
                        <div className="lg:col-span-2 space-y-6 sm:space-y-8">

                            {/* Pain Progress Chart */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center mb-4 sm:mb-6">
                                    <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                                    Pain Level History
                                </h2>

                                {progressHistory.length < 2 ? (
                                    <div className="h-48 sm:h-64 flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50 p-4 text-center">
                                        <p className="text-slate-500 font-medium text-sm sm:text-base">Log at least two sessions to see your progress chart.</p>
                                    </div>
                                ) : (
                                    <div className="h-64 sm:h-72 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={progressHistory}
                                                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                                <XAxis
                                                    dataKey="displayDate"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#64748B', fontSize: 10 }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    domain={[0, 10]}
                                                    ticks={[0, 2, 4, 6, 8, 10]}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#64748B', fontSize: 10 }}
                                                />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                    labelStyle={{ fontWeight: 'bold', color: '#0F172A' }}
                                                    itemStyle={{ color: '#0F172A' }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="pain_level"
                                                    name="Pain Level"
                                                    stroke="#4F46E5"
                                                    strokeWidth={3}
                                                    dot={{ r: 3, strokeWidth: 2, fill: '#4F46E5', stroke: '#FFFFFF' }}
                                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#4F46E5' }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>

                            {/* Recent History List */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
                                    <h2 className="text-lg font-bold text-slate-900">Recent Sessions</h2>
                                </div>

                                <div className="p-0">
                                    {progressHistory.length === 0 ? (
                                        <div className="text-center py-10 text-slate-500 px-4">
                                            No sessions logged yet.
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-slate-200 max-h-80 overflow-y-auto">
                                            {[...progressHistory].reverse().map((log) => (
                                                <li key={log.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <div className="pr-2">
                                                            <p className="font-semibold text-slate-900 border-b border-slate-200 inline-block pb-1 text-sm sm:text-base">
                                                                {format(new Date(log.session_date), 'MMMM d, yyyy')}
                                                            </p>
                                                            {log.mobility_notes && (
                                                                <p className="mt-2 text-xs sm:text-sm text-slate-500 italic">
                                                                    "{log.mobility_notes}"
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className={`px-2 py-1 sm:px-3 sm:py-2 rounded-xl flex flex-col items-center justify-center shadow-sm border ${log.pain_level > 7 ? 'bg-red-50 border-red-200 text-red-700' :
                                                            log.pain_level > 4 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-green-50 border-green-200 text-green-700'
                                                            } flex-shrink-0`}>
                                                            <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider opacity-80">Pain</span>
                                                            <span className="text-base sm:text-lg font-extrabold">{log.pain_level}/10</span>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PatientDashboard;

