import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Users,
  Briefcase,
  FileText,
  MessageCircle,
  Search,
  ChevronDown,
  ChevronRight,
  LogOut,
  Settings,
  Award,
  TrendingUp,
  Calendar,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Star,
  Info
} from 'lucide-react';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';

const navigation = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'about', label: 'About Us', icon: Users },
  { id: 'services', label: 'Services', icon: Briefcase },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'contacts', label: 'Contacts', icon: MessageCircle }
];

const customerMenu = [
  { id: 'customers-current', label: 'Current' },
  { id: 'services', label: 'Services' },
  { id: 'customers-new', label: 'New' },
  { id: 'customers-negotiating', label: 'Negotiating' }
];

const teamMembers = [
  {
    name: 'John Paul Nob',
    role: 'President',
    photo: '/images/nobpfp.jpg',
    bio1:
      'As the president of the organization, John Paul embodies leadership, dedication, and resilience. He believes in empowering every member to grow not just as a leader, but also as an individual with purpose.',
    bio2:
      'Guided by vision and teamwork, he continuously inspires the group to strive for excellence, build unity, and create meaningful impact within the student community.'
  },
  {
    name: 'Christine Marie Amarille',
    role: 'Vice President',
    photo: '/images/karla.jpg',
    bio1:
      'Christine supports the organization with passion and heart. As Vice President, she champions collaboration and makes sure every leader’s voice is heard and valued.',
    bio2:
      'She believes that success comes from working together and lifting one another up, creating an environment where members feel inspired to contribute and lead with confidence.'
  },
  {
    name: 'Glavine Layo',
    role: 'Secretary',
    photo: '/images/julienne.jpg',
    bio1: 'Passionate about student leadership and organizational management.',
    bio2: 'Helps coordinate events and documentation for the organization.'
  },
  {
    name: 'Kristine Baygan',
    role: 'Treasurer',
    photo: '/images/kristine.jpg',
    bio1: 'Manages the organization’s funds and financial reports.',
    bio2: 'Ensures transparent and organized financial tracking.'
  },
  {
    name: 'Christine Amarille',
    role: 'auditor',
    photo: '/images/christine.jpg',
    bio1: 'Oversees auditing and compliance within the organization.',
    bio2: 'Works closely with officers for accurate records.'
  },
  {
    name: 'Sample Member',
    role: 'PRO',
    photo: '/images/sample.jpg',
    bio1: 'Handles public relations and announcements.',
    bio2: 'Connects the organization with the student community.'
  },
  {
    name: 'Events Coordinator',
    role: 'Events Head',
    photo: '/images/events.jpg',
    bio1: 'Leads the planning and execution of organizational events and activities.',
    bio2: 'Ensures every event is well-organized, engaging, and aligned with the group’s goals.'
  },
  {
    name: 'Membership Officer',
    role: 'Member Relations',
    photo: '/images/membership.jpg',
    bio1: 'Focuses on member engagement and onboarding new students into the organization.',
    bio2: 'Supports members by listening to concerns and helping them stay active and involved.'
  },
  {
    name: 'Documentation Officer',
    role: 'Documentation',
    photo: '/images/documentation.jpg',
    bio1: 'Keeps records of meetings, events, and important organizational milestones.',
    bio2: 'Helps preserve the history and achievements of the organization through proper documentation.'
  }
];

const Dashboard = () => {
  const { currentUser, userRole, logout } = useAuth();
  const [selectedSection, setSelectedSection] = useState('home');
  const [customersOpen, setCustomersOpen] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingTasks: 0,
    completedTasks: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [profileImage, setProfileImage] = useState(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('profileImage') || null;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const totalMembers = usersSnapshot.size;

        const activitiesQuery = query(
          collection(db, 'activities'),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const activitiesSnapshot = await getDocs(activitiesQuery);
        const activities = activitiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setStats({
          totalMembers,
          activeMembers: Math.max(0, totalMembers - 2),
          pendingTasks: Math.floor(Math.random() * 8) + 3,
          completedTasks: Math.floor(Math.random() * 12) + 8
        });
        setRecentActivities(activities);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setProfileImage(reader.result);
        try {
          localStorage.setItem('profileImage', reader.result);
        } catch (err) {
          console.error('Unable to save profile image to localStorage:', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const renderHome = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr] gap-6">
        <div className="bg-white rounded-3xl shadow-sm p-8 flex flex-col items-center text-center space-y-6">
          <div className="relative flex flex-col items-center">
            <div className="relative -mt-16 group">
              <img
                src={
                  profileImage ||
                  'https://images.unsplash.com/photo-1521572275906-65b1c69d88a5?auto=format&fit=facearea&w=200&h=200&q=80'
                }
                alt="Profile"
                className="h-32 w-32 rounded-full object-cover shadow-lg border-4 border-white"
              />
              <label
                htmlFor="profileUpload"
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center text-[11px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                Upload photo
              </label>
              <input
                id="profileUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Hello, {currentUser.displayName || 'Someone'}!</h2>
            <p className="text-sm text-gray-500 uppercase tracking-[0.4em]">
              ORGANIZATIONAL PROFILING SYSTEM
            </p>
          </div>
          <div className="w-full pt-6 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Role</span>
              <span className="inline-flex items-center space-x-2 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-500">
                <Award className="h-4 w-4" />
                <span>{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Member'}</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Events this month</span>
              <span className="font-semibold text-gray-900">{stats.pendingTasks}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Completed tasks</span>
              <span className="font-semibold text-gray-900">{stats.completedTasks}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-sm p-10">
          <h1 className="text-4xl font-bold mb-6">Welcome</h1>
          <p className="text-gray-600 leading-relaxed mb-6">
            he Student Organization is a dynamic community of passionate and dedicated young leaders who
            strive to create positive change within the campus. With a strong commitment to service,
            innovation, and academic excellence, the organization aims to provide opportunities that help
            students develop their leadership potential, enhance their skills, and build meaningful
            connections.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We work collaboratively to organize impactful events, support student initiatives, and promote
            inclusivity within the school community. Through active participation and teamwork, we inspire
            individuals to step beyond their comfort zones, lead with purpose, and contribute to the
            betterment of both the organization and the institution.
            <br />
            <br />
            Driven by integrity, unity, and excellence, our mission is to cultivate responsible and engaged
            student leaders who are not only equipped for academic success but also prepared to make a
            positive impact in society. Together, we believe that small actions can lead to significant
            change — and as one organization, we strive to empower every student to grow, lead, and inspire
            others.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-gray-100 p-6 bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Members</p>
                  <p className="text-2xl font-semibold">{stats.activeMembers}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-100 p-6 bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Upcoming Events</p>
                  <p className="text-2xl font-semibold">{Math.max(2, stats.pendingTasks - 1)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white shadow-sm p-8">
          <h3 className="text-xl font-semibold mb-4">Quick Updates</h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 rounded-2xl bg-gray-50 p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100">
                    <Info className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {activity.title || 'New activity'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.description || 'Activity updated for the organization.'}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-widest text-gray-400">
                      {activity.timestamp
                        ? new Date(activity.timestamp.toDate()).toLocaleDateString()
                        : 'Recently'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 p-12 text-center text-gray-500">
                <AlertCircle className="h-8 w-8 mb-4 text-gray-400" />
                No recent activities
              </div>
            )}
          </div>
        </div>
        <div className="rounded-3xl bg-white shadow-sm p-8">
          <h3 className="text-xl font-semibold mb-4">Member Highlights</h3>
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-2xl border border-gray-100 p-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200" />
                  <div>
                    <p className="font-semibold text-gray-800">Member {index + 1}</p>
                    <p className="text-sm text-gray-500">Role designation</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Star className="h-4 w-4 text-amber-400" />
                  Top performer
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white shadow-sm p-8">
        <h1 className="text-4xl font-bold mb-2">About Us!</h1>
        <p className="text-gray-500">Meet the leaders behind our organization</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto pr-2">
        {teamMembers.map((member) => (
          <div
            key={member.name}
            className="rounded-3xl bg-white shadow-sm p-6 space-y-4 flex flex-col min-h-[360px] max-h-[360px]"
          >
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
              <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-semibold text-gray-9">{member.name}</p>
              <p className="text-sm text-gray-500">{member.role}</p>
            </div>
            <div className="space-y-2 text-sm text-gray-600 flex-1 overflow-y-auto">
              <p>{member.bio1}</p>
              <p>{member.bio2}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="rounded-3xl bg-white shadow-sm p-10 min-h-[520px]">
      <h1 className="text-4xl font-bold mb-4">Services</h1>
      <p className="text-gray-500">Showcase the programs and services offered by the organization.</p>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white shadow-sm p-10 min-h-[200px]">
        <h1 className="text-4xl font-bold mb-4">Reports</h1>
        <p className="text-gray-500 max-w-2xl">
          Keep track of organizational performance, progress updates, and data insights aligned with
          your objectives.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white shadow-sm p-10 min-h-[260px] border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 flex items-center space-x-3">
            <span>Quarterly Highlights</span>
            <TrendingUp className="h-5 w-5 text-red-400" />
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus id metus ac elit convallis
            tempus. Curabitur malesuada purus ex.
          </p>
        </div>
        <div className="rounded-3xl bg-white shadow-sm p-10 min-h-[260px] border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 flex items-center space-x-3">
            <span>Membership Growth</span>
            <Users className="h-5 w-5 text-emerald-400" />
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis
            egestas. Suspendisse potenti.
          </p>
        </div>
      </div>
    </div>
  );

  const renderContacts = () => (
    <div className="grid grid-cols-1 xl:grid-cols-[360px,1fr] gap-6">
      <div className="space-y-6">
        <div className="rounded-3xl bg-white shadow-sm p-8">
          <h1 className="text-4xl font-bold mb-6">Contacts</h1>
          <div className="space-y-4">
            {[
              { name: 'John Paul', title: 'President' },
              { name: 'Karla Alo-ot', title: 'Boang' },
              { name: 'Julienne', title: 'Tomboy' },
              { name: 'Kristine Baygan', title: 'gae' },
              { name: 'Christine Amarille', title: 'Vice president sa mga tomboy' }
            ].map((contact) => (
              <div
                key={contact.name}
                className="group flex items-center rounded-2xl px-5 py-4 transition bg-gray-50 text-gray-700 hover:bg-[#f04b4b] hover:text-white hover:shadow-lg"
              >
                {/* LEFT: icon + name/title (takes leftover width, neat alignment) */}
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center group-hover:bg-white/20">
                    <Users className="h-5 w-5 text-gray-400 group-hover:text-white" />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-semibold leading-tight">
                      {contact.name}
                    </p>
                    <p className="text-sm text-gray-500 group-hover:text-white/70">
                      {contact.title}
                    </p>
                  </div>
                </div>

                {/* RIGHT: action icons – aligned and only visible on hover */}
                <div className="hidden group-hover:flex items-center space-x-4 text-sm ml-4">
                  <button className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/30 hover:bg_white/50 transition">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/30 hover:bg-white/50 transition">
                    <Mail className="h-4 w-4" />
                  </button>
                  <button className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/30 hover:bg-white/50 transition">
                    <Star className="h-4 w-4" />
                  </button>
                  <button className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/30 hover:bg-white/50 transition">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white shadow-sm p-8">
          <h3 className="text-lg font-semibold mb-4">Groups (3)</h3>
          <div className="space-y-3">
            {['Structure', 'IT', 'CS'].map((group) => (
              <label key={group} className="flex items-center space-x-3 text-gray-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#f04b4b] focus:ring-[#f04b4b]"
                />
                <span>{group}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white shadow-sm p-8 flex flex-col">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200">
            {profileImage && (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">John Paul</h2>
            <p className="text-sm text-gray-500">President</p>
          </div>
        </div>

        <div className="mt-8 space-y-4 text-sm text-gray-600">
          <div className="flex items-start space-x-3">
            <Phone className="h-4 w-4 text-gray-400 mt-1" />
            <span>+63 912 345 6789</span>
          </div>
          <div className="flex items-start space-x-3">
            <Mail className="h-4 w-4 text-gray-400 mt-1" />
            <span>john.paul@studentorg.com</span>
          </div>
          <div className="flex items-start space-x-3">
            <MapPin className="h-4 w-4 text-gray-400 mt-1" />
            <span>University Town, City Campus</span>
          </div>
        </div>

        <div className="mt-auto pt-8">
          <label className="text-sm font-medium text-gray-500 mb-2 block">
            Send a message
          </label>
          <textarea
            rows={4}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 focus:border-[#f04b4b] focus:ring-2 focus:ring-[#f04b4b]/30"
            placeholder="Type your message here..."
          />
          <button className="mt-4 h-12 w-full rounded-2xl bg-[#f04b4b] text-white font-semibold hover:bg-[#e43a3a] transition">
            Send message
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedSection) {
      case 'home':
        return renderHome();
      case 'about':
        return renderAbout();
      case 'services':
        return renderServices();
      case 'reports':
        return renderReports();
      case 'contacts':
        return renderContacts();
      default:
        return renderHome();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-gray-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f7f7f7]">
      <div className="w-full h-screen overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full">
          <aside className="w-full lg:w-72 xl:w-80 bg-white px-6 py-8 flex flex-col space-y-8 border-r border-gray-100 h-full overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-[#f04b4b] text-white flex items-center justify-center font-semibold shadow-md">
                  SO
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Student</p>
                  <p className="text-lg font-semibold text-gray-900">Organization</p>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  className="w-full h-12 rounded-2xl bg-gray-50 pl-11 pr-4 text-sm text-gray-600 border border-transparent focus:border-[#f04b4b] focus:bg-white focus:ring-2 focus:ring-[#f04b4b]/30 transition"
                  placeholder="Search"
                />
              </div>
            </div>

            <nav className="space-y-3 flex-1">
              {navigation.map((item) => {
                const active = selectedSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedSection(item.id)}
                    className={`w-full flex items-center space-x-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition
                      ${active ? 'bg-[#f04b4b] text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <item.icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => setCustomersOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  <span className="inline-flex items-center space-x-3">
                    <Users className="h-5 w-5 text-amber-500" />
                    <span>Customers</span>
                  </span>
                  {customersOpen ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                {customersOpen && (
                  <div className="pl-4 space-y-2">
                    {customerMenu.map((item) => {
                      const active = selectedSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() =>
                            setSelectedSection(item.id === 'services' ? 'services' : selectedSection)
                          }
                          className={`w-full rounded-2xl px-4 py-2 text-left text-sm transition
                            ${
                              active
                                ? 'bg-[#fceeea] text-[#e74242]'
                                : 'text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>

            <div className="space-y-4">
              <div className="rounded-3xl bg-gray-50 p-4 flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {profileImage && (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {currentUser.displayName || 'Karla'}
                  </p>
                  <span className="inline-flex items-center space-x-2 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-600">
                    <span>
                      {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Member'}
                    </span>
                  </span>
                </div>
              </div>
              <button className="w-full flex items-center space-x-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-gray-600 hover:bg-gray-100">
                <Settings className="h-5 w-5 text-gray-400" />
                <span>Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-[#f04b4b] hover:bg-[#fceeea]"
              >
                <LogOut className="h-5 w-5" />
                <span>Log out</span>
              </button>
            </div>
          </aside>

          <main className="flex-1 bg-[#f7f7f7] px-6 lg:px-10 py-10 overflow-y-auto h-full">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
