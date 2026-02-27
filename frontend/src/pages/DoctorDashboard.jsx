import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doctorService } from '../services/api';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Activity, Users, LogOut, FileText, CheckCircle } from 'lucide-react';

// Draggable Exercise Item
const ExerciseItem = ({ exercise }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'EXERCISE',
        item: { name: exercise.name },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag}
            className={`p-3 mb-2 rounded-lg border flex items-center justify-between cursor-grab transition-all duration-200 ${isDragging ? 'opacity-50 border-indigo-500 bg-blue-50' : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-400'
                }`}
        >
            <span className="font-medium text-slate-900">{exercise.name}</span>
            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                <Activity size={12} className="text-indigo-600" />
            </div>
        </div>
    );
};

// Simple Patient Card for selecting a user
const PatientCard = ({ patient, isSelected, onClick }) => {
    return (
        <div
            onClick={() => onClick(patient)}
            className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${isSelected
                ? 'border-indigo-500 bg-blue-50 shadow-md ring-1 ring-indigo-200'
                : 'border-slate-200 bg-white shadow hover:shadow-md hover:border-indigo-400 hover:bg-slate-50'
                }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className={`h-10 w-10 rounded-full border border-slate-200 flex flex-shrink-0 items-center justify-center text-white font-bold text-lg ${isSelected ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-50'
                        }`}>
                        {patient.first_name[0]}{patient.last_name[0]}
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="text-lg font-semibold text-slate-900 truncate">
                            {patient.first_name} {patient.last_name}
                        </h3>
                        <p className="text-sm text-slate-500 truncate">{patient.email}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Drop Area Component
const PatientDropArea = ({ selectedPatient, patientExercises, onAssign, onRemove }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'EXERCISE',
        drop: (item) => {
            if (selectedPatient) {
                onAssign(selectedPatient.id, item.name);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [selectedPatient, onAssign]);

    return (
        <div
            ref={drop}
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${isOver
                ? 'border-indigo-500 bg-indigo-50 shadow-inner'
                : 'border-dashed border-slate-200 bg-white hover:border-indigo-400'
                }`}
        >
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                <h3 className="text-md font-bold text-slate-900">Currently Assigned Exercises</h3>
                {isOver && <span className="text-xs font-bold text-indigo-600 animate-pulse">Drop here!</span>}
            </div>

            {patientExercises.length === 0 ? (
                <div className="py-6 text-center text-slate-500 flex flex-col items-center justify-center">
                    <Activity className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-sm italic">Drag exercises here from the library on the right to assign them to {selectedPatient?.first_name || 'patient'}.</p>
                </div>
            ) : (
                <div className="flex flex-wrap gap-2 min-h-[60px] content-start">
                    {patientExercises.map((ex) => (
                        <div key={ex.id} className="bg-slate-50 border border-slate-200 text-slate-900 pl-3 pr-2 py-1.5 rounded-full text-sm font-medium flex items-center shadow-sm group">
                            <CheckCircle size={14} className="mr-1.5 text-indigo-600" />
                            {ex.exercise_name}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(ex.id, ex.exercise_name);
                                }}
                                className="ml-2 p-0.5 rounded-full hover:bg-red-100 text-slate-500 hover:text-red-700 transition-colors"
                                title="Remove exercise"
                            >
                                <Users size={12} className="rotate-45" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const predefinedExercises = [
    { id: 1, name: 'Shoulder Flexion (Wall Slide)' },
    { id: 2, name: 'Neck Rotations' },
    { id: 3, name: 'Hamstring Stretch' },
    { id: 4, name: 'Ankle Pumps' },
    { id: 5, name: 'Knee Extensions' },
    { id: 6, name: 'Pelvic Tilts' },
    { id: 7, name: 'Bicep Curls (Light Band)' },
    { id: 8, name: 'Core Stabilization' },
];

const DoctorDashboard = () => {
    const { user, logout } = useAuth();
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientProgress, setPatientProgress] = useState([]);
    const [patientExercises, setPatientExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const data = await doctorService.getPatients(user.id);
            setPatients(data.patients);
        } catch (error) {
            console.error('Failed to fetch patients:', error);
            showNotification('Failed to load patients', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePatientSelect = async (patient) => {
        setSelectedPatient(patient);
        try {
            const data = await doctorService.getPatientProgress(user.id, patient.id);
            setPatientProgress(data.progress || []);
            setPatientExercises(data.assigned_exercises || []);
        } catch (error) {
            console.error('Failed to fetch progress:', error);
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAssignExercise = async (patientId, exerciseName) => {
        try {
            await doctorService.assignExercise(user.id, patientId, exerciseName);

            const patient = patients.find(p => p.id === patientId);
            showNotification(`Successfully assigned ${exerciseName} to ${patient?.first_name || 'patient'}`);

            // If the drop happened on the currently selected patient, immediately re-fetch to reflect
            if (selectedPatient && selectedPatient.id === patientId) {
                handlePatientSelect(selectedPatient);
            }
        } catch (error) {
            console.error('Failed to assign exercise:', error);
            showNotification('Failed to assign exercise', 'error');
        }
    };

    const handleRemoveExercise = async (exerciseId, exerciseName) => {
        if (!selectedPatient) return;

        // Optimistic update
        setPatientExercises(prev => prev.filter(ex => ex.id !== exerciseId));

        try {
            await doctorService.removeExercise(user.id, selectedPatient.id, exerciseId);
            showNotification(`Removed ${exerciseName} from routine`);
        } catch (error) {
            console.error('Failed to remove exercise:', error);
            showNotification('Failed to remove exercise', 'error');
            // Revert on failure
            handlePatientSelect(selectedPatient);
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen bg-slate-50 flex flex-col">
                {/* Navbar */}
                <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <Activity className="h-6 w-6 text-white" />
                            </div>
                            <span className="ml-3 text-xl font-bold text-slate-900 tracking-tight block max-sm:hidden">Doctor Portal</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex flex-col items-end mr-2">
                                <span className="text-slate-900 font-bold max-sm:text-sm">Dr. {user.first_name} {user.last_name}</span>
                                {user.unique_doctor_code && (
                                    <span className="text-xs text-indigo-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-indigo-200 mt-1 cursor-default select-all" title="Share this code with your patients">
                                        Patient Invite Code: {user.unique_doctor_code}
                                    </span>
                                )}
                            </div>
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

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 h-full min-h-[calc(100vh-12rem)]">

                        {/* Left Column: Patients List */}
                        <div className="lg:col-span-4 flex flex-col lg:h-[calc(100vh-8rem)] min-h-[400px]">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                                <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center">
                                        <Users className="h-5 w-5 mr-2 text-indigo-600" />
                                        My Patients ({patients.length})
                                    </h2>
                                </div>

                                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-slate-50/50">
                                    {loading ? (
                                        <div className="flex justify-center py-10">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                        </div>
                                    ) : patients.length === 0 ? (
                                        <div className="text-center py-10 text-slate-500 bg-white rounded-lg border border-dashed border-slate-200">
                                            No patients found.
                                        </div>
                                    ) : (
                                        patients.map(patient => (
                                            <PatientCard
                                                key={patient.id}
                                                patient={patient}
                                                isSelected={selectedPatient && selectedPatient.id === patient.id}
                                                onClick={handlePatientSelect}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Middle Column: Patient Details / Progress */}
                        <div className="lg:col-span-5 flex flex-col lg:h-[calc(100vh-8rem)] min-h-[400px]">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                                <div className="p-4 sm:p-5 border-b border-slate-200 bg-white">
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center">
                                        <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                                        {selectedPatient ? `${selectedPatient.first_name}'s Progress` : 'Select a Patient'}
                                    </h2>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
                                    {!selectedPatient ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                                            <Users className="h-16 w-16 mb-4 opacity-50" />
                                            <p className="text-lg font-medium text-slate-900">Select a patient from the list</p>
                                            <p className="text-sm">to view their progress logs</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {/* Assigned Exercises Section - NOW THE DROP ZONE */}
                                            <PatientDropArea
                                                selectedPatient={selectedPatient}
                                                patientExercises={patientExercises}
                                                onAssign={handleAssignExercise}
                                                onRemove={handleRemoveExercise}
                                            />

                                            {/* Progress Logs Section */}
                                            <div>
                                                <h3 className="text-md font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">Session History</h3>
                                                {patientProgress.length === 0 ? (
                                                    <div className="text-center py-8 text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">
                                                        <p className="font-medium text-slate-900">No progress logs found.</p>
                                                        <p className="text-sm mt-1">This patient hasn't logged any sessions yet.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4 sm:space-y-6">
                                                        {patientProgress.map((log) => (
                                                            <div key={log.id} className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm transition hover:shadow-md hover:border-indigo-300 relative overflow-hidden">
                                                                {/* Pain level indicator line */}
                                                                <div className={`absolute top-0 left-0 w-1 h-full ${log.pain_level > 7 ? 'bg-red-500' :
                                                                    log.pain_level > 4 ? 'bg-yellow-400' : 'bg-green-500'
                                                                    }`}></div>

                                                                <div className="flex justify-between items-start mb-3 ml-3">
                                                                    <h4 className="font-bold text-slate-900 text-base sm:text-lg">
                                                                        Session: {new Date(log.session_date).toLocaleDateString()}
                                                                    </h4>
                                                                    <span className={`px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-bold flex items-center flex-shrink-0 ml-2 border ${log.pain_level > 7 ? 'bg-red-100 text-red-700 border-red-200' :
                                                                        log.pain_level > 4 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-green-100 text-green-700 border-green-200'
                                                                        }`}>
                                                                        Pain: {log.pain_level}/10
                                                                    </span>
                                                                </div>

                                                                {log.mobility_notes && (
                                                                    <div className="bg-slate-50 rounded-lg p-3 ml-3 border border-slate-200 overflow-hidden break-words">
                                                                        <p className="text-xs font-semibold text-slate-500 mb-1 tracking-wider uppercase">Patient Notes</p>
                                                                        <p className="text-slate-900 text-sm sm:text-base leading-relaxed">{log.mobility_notes}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Exercise Library */}
                        <div className="lg:col-span-3 flex flex-col lg:h-[calc(100vh-8rem)] min-h-[300px]">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                                <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-br from-indigo-50 to-blue-50">
                                    <h2 className="text-lg font-bold text-slate-900 flex flex-col">
                                        <span>Exercise Library</span>
                                        <span className="text-xs font-normal text-slate-500 mt-1 block sm:hidden">Tap and hold to move</span>
                                        <span className="text-xs font-normal text-slate-500 mt-1 hidden sm:block">Drag and drop to assign to patients</span>
                                    </h2>
                                </div>

                                <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-50/50">
                                    <div className="space-y-2">
                                        {predefinedExercises.map((exercise) => (
                                            <ExerciseItem key={exercise.id} exercise={exercise} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </DndProvider>
    );
};

export default DoctorDashboard;

