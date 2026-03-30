import React, { useState, useMemo, useCallback } from 'react';
import { useData } from '../DataContext.tsx';
import { RoomStatus, Room } from '../types.ts';

interface HousekeepingPageProps {
  onLogout: () => void;
}

type StaffTab = 'tasks' | 'schedule' | 'inventory' | 'reports';

interface CleaningTask {
  id: string;
  roomId: string;
  roomNumber: string;
  roomType: string;
  floor: number;
  type: 'checkout-clean' | 'stay-over' | 'deep-clean' | 'maintenance' | 'inspection';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'inspected';
  assignedTo: string;
  estimatedTime: string;
  notes?: string;
  checklist: { item: string; done: boolean }[];
  startedAt?: string;
  completedAt?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  current: number;
  minimum: number;
  maximum: number;
  unit: string;
}

const HousekeepingPage: React.FC<HousekeepingPageProps> = ({ onLogout }) => {
  const { rooms, setRoomStatus } = useData();
  const [activeTab, setActiveTab] = useState<StaffTab>('tasks');
  const [selectedTask, setSelectedTask] = useState<CleaningTask | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showReportIssueModal, setShowReportIssueModal] = useState(false);
  const [issueRoom, setIssueRoom] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueCategory, setIssueCategory] = useState('plumbing');
  const [issuePriority, setIssuePriority] = useState('normal');
  const [issueSubmitted, setIssueSubmitted] = useState(false);
  const currentStaff = 'Alex Rivera';

  // Generate cleaning tasks from room data
  const [tasks, setTasks] = useState<CleaningTask[]>(() => {
    const generatedTasks: CleaningTask[] = [];
    rooms.forEach((room) => {
      if (room.status === RoomStatus.DIRTY) {
        generatedTasks.push({
          id: `task-${room.id}`,
          roomId: room.id,
          roomNumber: room.number,
          roomType: room.type,
          floor: room.floor,
          type: 'checkout-clean',
          priority: 'high',
          status: 'pending',
          assignedTo: currentStaff,
          estimatedTime: '45 min',
          checklist: [
            { item: 'Strip and remake beds', done: false },
            { item: 'Clean and sanitize bathroom', done: false },
            { item: 'Vacuum and mop floors', done: false },
            { item: 'Dust surfaces and furniture', done: false },
            { item: 'Restock amenities', done: false },
            { item: 'Check minibar inventory', done: false },
            { item: 'Empty trash bins', done: false },
            { item: 'Inspect for damages', done: false },
          ],
        });
      } else if (room.status === RoomStatus.CLEANING) {
        generatedTasks.push({
          id: `task-${room.id}`,
          roomId: room.id,
          roomNumber: room.number,
          roomType: room.type,
          floor: room.floor,
          type: 'stay-over',
          priority: 'normal',
          status: 'in-progress',
          assignedTo: currentStaff,
          estimatedTime: '30 min',
          startedAt: '10:30 AM',
          checklist: [
            { item: 'Make beds', done: true },
            { item: 'Clean bathroom', done: true },
            { item: 'Vacuum floors', done: false },
            { item: 'Replace towels', done: false },
            { item: 'Restock amenities', done: false },
            { item: 'Empty trash', done: true },
          ],
        });
      } else if (room.status === RoomStatus.MAINTENANCE) {
        generatedTasks.push({
          id: `task-${room.id}`,
          roomId: room.id,
          roomNumber: room.number,
          roomType: room.type,
          floor: room.floor,
          type: 'maintenance',
          priority: 'urgent',
          status: 'pending',
          assignedTo: currentStaff,
          estimatedTime: '60 min',
          notes: room.maintenanceNote || 'General maintenance required',
          checklist: [
            { item: 'Diagnose issue', done: false },
            { item: 'Fix/repair', done: false },
            { item: 'Test operation', done: false },
            { item: 'Clean affected area', done: false },
            { item: 'Update maintenance log', done: false },
          ],
        });
      }
    });
    // Add some extra mocked completed tasks for realistic feel
    generatedTasks.push({
      id: 'task-done-1',
      roomId: 'r106',
      roomNumber: '106',
      roomType: 'Standard King',
      floor: 1,
      type: 'checkout-clean',
      priority: 'normal',
      status: 'completed',
      assignedTo: currentStaff,
      estimatedTime: '40 min',
      startedAt: '8:00 AM',
      completedAt: '8:38 AM',
      checklist: Array(8).fill(null).map((_, i) => ({ item: `Task item ${i + 1}`, done: true })),
    });
    generatedTasks.push({
      id: 'task-done-2',
      roomId: 'r109',
      roomNumber: '109',
      roomType: 'Standard King',
      floor: 1,
      type: 'stay-over',
      priority: 'normal',
      status: 'inspected',
      assignedTo: currentStaff,
      estimatedTime: '25 min',
      startedAt: '9:00 AM',
      completedAt: '9:22 AM',
      checklist: Array(6).fill(null).map((_, i) => ({ item: `Task item ${i + 1}`, done: true })),
    });
    return generatedTasks;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: 'inv1', name: 'Bath Towels', category: 'Linens', icon: 'dry_cleaning', current: 45, minimum: 20, maximum: 100, unit: 'pcs' },
    { id: 'inv2', name: 'Hand Towels', category: 'Linens', icon: 'dry_cleaning', current: 62, minimum: 30, maximum: 120, unit: 'pcs' },
    { id: 'inv3', name: 'Bed Sheets (King)', category: 'Linens', icon: 'bed', current: 18, minimum: 15, maximum: 50, unit: 'sets' },
    { id: 'inv4', name: 'Bed Sheets (Queen)', category: 'Linens', icon: 'bed', current: 22, minimum: 15, maximum: 50, unit: 'sets' },
    { id: 'inv5', name: 'Pillowcases', category: 'Linens', icon: 'bedroom_parent', current: 80, minimum: 40, maximum: 150, unit: 'pcs' },
    { id: 'inv6', name: 'Shampoo', category: 'Amenities', icon: 'soap', current: 120, minimum: 50, maximum: 200, unit: 'bottles' },
    { id: 'inv7', name: 'Body Wash', category: 'Amenities', icon: 'soap', current: 95, minimum: 50, maximum: 200, unit: 'bottles' },
    { id: 'inv8', name: 'Conditioner', category: 'Amenities', icon: 'soap', current: 88, minimum: 50, maximum: 200, unit: 'bottles' },
    { id: 'inv9', name: 'Toilet Paper', category: 'Amenities', icon: 'paper_roll', current: 200, minimum: 100, maximum: 400, unit: 'rolls' },
    { id: 'inv10', name: 'All-Purpose Cleaner', category: 'Cleaning', icon: 'cleaning_services', current: 12, minimum: 10, maximum: 30, unit: 'liters' },
    { id: 'inv11', name: 'Glass Cleaner', category: 'Cleaning', icon: 'cleaning_services', current: 8, minimum: 5, maximum: 20, unit: 'liters' },
    { id: 'inv12', name: 'Disinfectant Spray', category: 'Cleaning', icon: 'sanitizer', current: 15, minimum: 10, maximum: 30, unit: 'cans' },
    { id: 'inv13', name: 'Trash Bags', category: 'Cleaning', icon: 'delete', current: 150, minimum: 80, maximum: 300, unit: 'pcs' },
    { id: 'inv14', name: 'Minibar Snacks Pack', category: 'Minibar', icon: 'fastfood', current: 30, minimum: 20, maximum: 60, unit: 'packs' },
    { id: 'inv15', name: 'Bottled Water', category: 'Minibar', icon: 'water_drop', current: 60, minimum: 40, maximum: 120, unit: 'bottles' },
    { id: 'inv16', name: 'Coffee Pods', category: 'Minibar', icon: 'coffee', current: 85, minimum: 50, maximum: 200, unit: 'pods' },
  ]);

  // Computed stats
  const stats = useMemo(() => {
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const completed = tasks.filter(t => t.status === 'completed' || t.status === 'inspected').length;
    const urgent = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed' && t.status !== 'inspected').length;
    const lowStock = inventory.filter(i => i.current <= i.minimum * 1.2).length;
    return { pending, inProgress, completed, urgent, total: tasks.length, lowStock };
  }, [tasks, inventory]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      return true;
    });
  }, [tasks, filterStatus, filterPriority]);

  const handleStartTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'in-progress' as const, startedAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) } : t));
    const task = tasks.find(t => t.id === taskId);
    if (task) setRoomStatus(task.roomId, RoomStatus.CLEANING);
  }, [tasks, setRoomStatus]);

  const handleCompleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' as const, completedAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) } : t));
    const task = tasks.find(t => t.id === taskId);
    if (task) setRoomStatus(task.roomId, RoomStatus.AVAILABLE);
  }, [tasks, setRoomStatus]);

  const handleToggleChecklist = useCallback((taskId: string, itemIndex: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const newChecklist = [...t.checklist];
      newChecklist[itemIndex] = { ...newChecklist[itemIndex], done: !newChecklist[itemIndex].done };
      return { ...t, checklist: newChecklist };
    }));
  }, []);

  const handleReportIssue = () => {
    setIssueSubmitted(true);
    // Create a maintenance task
    if (issueRoom) {
      const room = rooms.find(r => r.number === issueRoom);
      if (room) {
        setRoomStatus(room.id, RoomStatus.MAINTENANCE);
      }
    }
    setTimeout(() => {
      setShowReportIssueModal(false);
      setIssueSubmitted(false);
      setIssueRoom('');
      setIssueDescription('');
    }, 2000);
  };

  const priorityColors: Record<string, string> = {
    urgent: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    'in-progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    inspected: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const typeIcons: Record<string, string> = {
    'checkout-clean': 'logout',
    'stay-over': 'hotel',
    'deep-clean': 'cleaning_services',
    maintenance: 'build',
    inspection: 'verified',
  };

  const currentTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  // ===== RENDER TABS =====

  const renderTasks = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {['all', 'pending', 'in-progress', 'completed'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 text-xs font-bold capitalize transition ${filterStatus === s ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >{s === 'all' ? 'All Tasks' : s}</button>
          ))}
        </div>
        <div className="flex bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {['all', 'urgent', 'high', 'normal'].map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-2 text-xs font-bold capitalize transition ${filterPriority === p ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >{p === 'all' ? 'All Priority' : p}</button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="material-symbols-outlined text-5xl text-emerald-400 mb-3">task_alt</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Clear!</h3>
          <p className="text-sm text-slate-500">No tasks match your current filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              onClick={() => { setSelectedTask(task); setShowChecklistModal(true); }}
              className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 cursor-pointer transition-all hover:border-primary/30 hover:shadow-md ${task.priority === 'urgent' ? 'border-l-4 border-l-rose-500' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                  task.status === 'completed' || task.status === 'inspected' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-primary/10'
                }`}>
                  <span className={`material-symbols-outlined ${
                    task.status === 'completed' || task.status === 'inspected' ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'
                  }`}>{typeIcons[task.type]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-lg text-slate-900 dark:text-white">Room {task.roomNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${priorityColors[task.priority]}`}>{task.priority}</span>
                  </div>
                  <p className="text-sm text-slate-500">{task.roomType} · Floor {task.floor}</p>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${statusColors[task.status]}`}>{task.status}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      {task.estimatedTime}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">checklist</span>
                      {task.checklist.filter(c => c.done).length}/{task.checklist.length}
                    </span>
                  </div>
                  {task.notes && (
                    <p className="text-xs text-rose-500 mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">warning</span>
                      {task.notes}
                    </p>
                  )}
                </div>
                <span className="material-symbols-outlined text-slate-300">chevron_right</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSchedule = () => {
    const shifts = [
      { time: '6:00 AM', label: 'Morning Shift Start', type: 'shift', icon: 'wb_sunny' },
      { time: '6:15 AM', label: 'Team Briefing — Lobby', type: 'meeting', icon: 'groups' },
      { time: '6:30 AM', label: 'Cart & Supply Pickup', type: 'task', icon: 'shopping_cart' },
      { time: '7:00 AM', label: 'Rooms 101-105 — Checkout Cleaning', type: 'clean', icon: 'cleaning_services' },
      { time: '9:30 AM', label: 'Rooms 106-110 — Stay-over Service', type: 'clean', icon: 'hotel' },
      { time: '11:00 AM', label: 'Break (30 min)', type: 'break', icon: 'coffee' },
      { time: '11:30 AM', label: 'Public Area Inspection', type: 'task', icon: 'visibility' },
      { time: '12:00 PM', label: 'Deep Clean — Room 103', type: 'deep', icon: 'cleaning_services' },
      { time: '1:00 PM', label: 'Inventory Check & Restock', type: 'task', icon: 'inventory_2' },
      { time: '2:00 PM', label: 'Morning Shift End', type: 'shift', icon: 'wb_twilight' },
    ];

    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Today's Schedule</h3>
              <p className="text-xs text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold">
              Morning Shift
            </div>
          </div>
          <div className="space-y-0">
            {shifts.map((item, i) => {
              const typeColors: Record<string, string> = {
                shift: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
                meeting: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
                task: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
                clean: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
                deep: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
                break: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
              };
              return (
                <div key={i} className="flex gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <div className={`size-3 rounded-full mt-1.5 shrink-0 ${i <= 3 ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                    {i < shifts.length - 1 && <div className="w-0.5 h-12 bg-slate-200 dark:bg-slate-800"></div>}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.time}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`size-7 rounded-lg flex items-center justify-center ${typeColors[item.type]}`}>
                        <span className="material-symbols-outlined text-sm">{item.icon}</span>
                      </div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team On Shift */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Team On Shift</h3>
          <div className="space-y-3">
            {[
              { name: 'Alex Rivera', role: 'Floor Lead', rooms: '101-110', status: 'active' },
              { name: 'Maria Santos', role: 'Housekeeper', rooms: '201-210', status: 'active' },
              { name: 'David Kim', role: 'Housekeeper', rooms: '301-310', status: 'on-break' },
              { name: 'Lisa Chen', role: 'Maintenance Tech', rooms: 'All Floors', status: 'active' },
            ].map((member, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-lg">person</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.role} · {member.rooms}</p>
                </div>
                <span className={`size-2.5 rounded-full ${member.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderInventory = () => {
    const categories = [...new Set(inventory.map(i => i.category))];
    
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        {stats.lowStock > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-500 text-2xl">warning</span>
            <div>
              <p className="font-bold text-sm text-amber-800 dark:text-amber-300">{stats.lowStock} items running low</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">These items are at or near minimum stock levels</p>
            </div>
          </div>
        )}

        {categories.map(cat => (
          <div key={cat} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">
                {cat === 'Linens' ? 'bed' : cat === 'Amenities' ? 'soap' : cat === 'Cleaning' ? 'cleaning_services' : 'local_cafe'}
              </span>
              {cat}
            </h3>
            <div className="space-y-3">
              {inventory.filter(i => i.category === cat).map(item => {
                const percentage = Math.round((item.current / item.maximum) * 100);
                const isLow = item.current <= item.minimum * 1.2;
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm font-semibold ${isLow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                          {item.name}
                          {isLow && <span className="material-symbols-outlined text-xs ml-1 text-amber-500">warning</span>}
                        </p>
                        <p className="text-xs text-slate-500">{item.current}/{item.maximum} {item.unit}</p>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isLow ? 'bg-amber-500' : percentage > 60 ? 'bg-emerald-500' : 'bg-primary'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderReports = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Daily Performance */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Today's Performance</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
            <p className="text-3xl font-black text-emerald-500">{stats.completed}</p>
            <p className="text-xs text-slate-500 mt-1">Rooms Cleaned</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
            <p className="text-3xl font-black text-amber-500">{stats.inProgress}</p>
            <p className="text-xs text-slate-500 mt-1">In Progress</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
            <p className="text-3xl font-black text-primary">38 min</p>
            <p className="text-xs text-slate-500 mt-1">Avg Clean Time</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
            <p className="text-3xl font-black text-purple-500">96%</p>
            <p className="text-xs text-slate-500 mt-1">Quality Score</p>
          </div>
        </div>
      </div>

      {/* Room Status Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Room Status Overview</h3>
        <div className="space-y-3">
          {[
            { status: 'Available', count: rooms.filter(r => r.status === RoomStatus.AVAILABLE).length, color: 'bg-emerald-500', total: rooms.length },
            { status: 'Occupied', count: rooms.filter(r => r.status === RoomStatus.OCCUPIED).length, color: 'bg-blue-500', total: rooms.length },
            { status: 'Cleaning', count: rooms.filter(r => r.status === RoomStatus.CLEANING).length, color: 'bg-amber-500', total: rooms.length },
            { status: 'Dirty', count: rooms.filter(r => r.status === RoomStatus.DIRTY).length, color: 'bg-rose-500', total: rooms.length },
            { status: 'Maintenance', count: rooms.filter(r => r.status === RoomStatus.MAINTENANCE).length, color: 'bg-slate-500', total: rooms.length },
          ].map(item => (
            <div key={item.status}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-400">{item.status}</span>
                <span className="font-bold text-slate-900 dark:text-white">{item.count}/{item.total}</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.count / item.total) * 100}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Activity Log</h3>
        <div className="space-y-3">
          {[
            { time: '10:45 AM', action: 'Room 106 marked as Clean', by: 'Alex Rivera', icon: 'check_circle', color: 'text-emerald-500' },
            { time: '10:30 AM', action: 'Started cleaning Room 103', by: 'Alex Rivera', icon: 'play_circle', color: 'text-amber-500' },
            { time: '9:22 AM', action: 'Room 109 inspected & approved', by: 'Supervisor', icon: 'verified', color: 'text-blue-500' },
            { time: '9:00 AM', action: 'Started cleaning Room 109', by: 'Alex Rivera', icon: 'play_circle', color: 'text-amber-500' },
            { time: '8:38 AM', action: 'Room 106 checkout clean completed', by: 'Alex Rivera', icon: 'check_circle', color: 'text-emerald-500' },
            { time: '8:00 AM', action: 'Started cleaning Room 106', by: 'Alex Rivera', icon: 'play_circle', color: 'text-amber-500' },
            { time: '6:15 AM', action: 'Morning shift briefing attended', by: 'Team', icon: 'groups', color: 'text-purple-500' },
          ].map((log, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className={`material-symbols-outlined text-lg mt-0.5 ${log.color}`}>{log.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{log.action}</p>
                <p className="text-xs text-slate-500">{log.time} · {log.by}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Premium Header */}
      <section className="relative overflow-hidden bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-5 sm:p-8 lg:p-12 text-white shadow-2xl mb-6 sm:mb-12">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 size-80 bg-primary/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 size-60 bg-indigo-500/5 rounded-full blur-[80px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               <span className="text-[10px] font-black uppercase tracking-widest text-white/70">On Duty • {currentStaff}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black tracking-tight leading-none text-white">
               Staff <span className="text-primary italic tracking-tighter">Operations.</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-lg text-sm sm:text-lg leading-relaxed">
               Managing <span className="text-white font-bold">{tasks.length} active assignments</span> for today's shift. Keep up the great work!
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 sm:gap-4 shrink-0">
             <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Shift Time</p>
                <div className="flex items-center gap-3">
                   <span className="material-symbols-outlined text-primary">schedule</span>
                   <span className="text-xl font-black text-white">{currentTime}</span>
                </div>
             </div>
             <button 
                onClick={() => setShowReportIssueModal(true)}
                className="group px-8 bg-rose-500 hover:bg-rose-600 rounded-3xl text-white text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-rose-500/20 transition-all flex items-center gap-3"
             >
                <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">report</span>
                Report Incident
             </button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Pending Tasks', value: stats.pending, icon: 'pending_actions', color: 'text-slate-400' },
          { label: 'In Progress', value: stats.inProgress, icon: 'sync', color: 'text-amber-500' },
          { label: 'Completed', value: stats.completed, icon: 'task_alt', color: 'text-emerald-500' },
          { label: 'Urgent Ops', value: stats.urgent, icon: 'priority_high', color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700/50 p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center mb-6">
              <span className={`material-symbols-outlined text-2xl ${stat.color}`}>{stat.icon}</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Modern Tabs Navigation */}
      <div className="relative">
        <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-full sm:w-fit overflow-x-auto scrollbar-hide">
          {[
            { id: 'tasks' as StaffTab, icon: 'checklist_rtl', label: 'My Pipeline' },
            { id: 'schedule' as StaffTab, icon: 'calendar_today', label: 'Schedule' },
            { id: 'inventory' as StaffTab, icon: 'inventory_2', label: 'Supplies' },
            { id: 'reports' as StaffTab, icon: 'bar_chart', label: 'Analytics' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider sm:tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-200 dark:border-slate-700/50 p-4 sm:p-6 lg:p-8 min-h-[400px] sm:min-h-[600px] shadow-sm">
        {activeTab === 'tasks' && renderTasks()}
        {activeTab === 'schedule' && renderSchedule()}
        {activeTab === 'inventory' && renderInventory()}
        {activeTab === 'reports' && renderReports()}
      </div>

      {/* ===== MODALS ===== */}

      {/* Task Checklist Modal */}
      {showChecklistModal && selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowChecklistModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-slate-900 dark:bg-slate-800 p-6 text-white shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Room</p>
                  <p className="text-4xl font-black tracking-tighter">{selectedTask.roomNumber}</p>
                  <p className="text-sm text-slate-400 mt-1">{selectedTask.roomType} · Floor {selectedTask.floor}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${priorityColors[selectedTask.priority]}`}>{selectedTask.priority}</span>
                  <p className="text-xs text-slate-400 mt-2">{selectedTask.type.replace('-', ' ')}</p>
                </div>
              </div>
              {selectedTask.notes && (
                <div className="mt-3 p-3 bg-rose-500/20 rounded-lg text-sm text-rose-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  {selectedTask.notes}
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">checklist</span>
                Cleaning Checklist
                <span className="text-xs text-slate-400 ml-auto">{selectedTask.checklist.filter(c => c.done).length}/{selectedTask.checklist.length}</span>
              </h4>
              <div className="space-y-2">
                {selectedTask.checklist.map((item, i) => (
                  <label
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      item.done ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => handleToggleChecklist(selectedTask.id, i)}
                      className="rounded text-emerald-500 focus:ring-emerald-500 size-5"
                    />
                    <span className={`text-sm font-medium ${item.done ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>{item.item}</span>
                  </label>
                ))}
              </div>

              {/* Time tracking */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {selectedTask.startedAt && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                    <p className="text-[10px] font-bold text-blue-400 uppercase">Started</p>
                    <p className="font-bold text-sm text-blue-700 dark:text-blue-300">{selectedTask.startedAt}</p>
                  </div>
                )}
                {selectedTask.completedAt && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase">Completed</p>
                    <p className="font-bold text-sm text-emerald-700 dark:text-emerald-300">{selectedTask.completedAt}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0">
              <button onClick={() => setShowChecklistModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold">
                Close
              </button>
              {selectedTask.status === 'pending' && (
                <button
                  onClick={() => { handleStartTask(selectedTask.id); setShowChecklistModal(false); }}
                  className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-600 transition"
                >
                  <span className="material-symbols-outlined text-lg">play_arrow</span>
                  Start Task
                </button>
              )}
              {selectedTask.status === 'in-progress' && (
                <button
                  onClick={() => { handleCompleteTask(selectedTask.id); setShowChecklistModal(false); }}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition"
                >
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showReportIssueModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowReportIssueModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            {issueSubmitted ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-6xl text-emerald-500 mb-4">task_alt</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Issue Reported!</h3>
                <p className="text-slate-500">The maintenance team has been notified.</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Report Maintenance Issue</h3>
                <p className="text-sm text-slate-500 mb-6">Flag a room issue for the maintenance team</p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Room Number</label>
                    <select value={issueRoom} onChange={e => setIssueRoom(e.target.value)} className="mt-1 w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none">
                      <option value="">Select Room</option>
                      {rooms.map(r => <option key={r.id} value={r.number}>Room {r.number} — {r.type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                    <select value={issueCategory} onChange={e => setIssueCategory(e.target.value)} className="mt-1 w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none">
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="hvac">HVAC / Air Conditioning</option>
                      <option value="furniture">Furniture / Fixtures</option>
                      <option value="appliance">Appliance</option>
                      <option value="safety">Safety Hazard</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</label>
                    <div className="flex gap-2 mt-1">
                      {['low', 'normal', 'high', 'urgent'].map(p => (
                        <button
                          key={p}
                          onClick={() => setIssuePriority(p)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition ${
                            issuePriority === p ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >{p}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                    <textarea
                      value={issueDescription}
                      onChange={e => setIssueDescription(e.target.value)}
                      placeholder="Describe the issue in detail..."
                      className="mt-1 w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none h-24 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowReportIssueModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold">Cancel</button>
                  <button onClick={handleReportIssue} disabled={!issueRoom} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-rose-600 transition flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">send</span>
                    Submit Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HousekeepingPage;
