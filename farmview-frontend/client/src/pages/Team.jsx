import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaUsers, FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

export default function Team() {
    const teamMembers = [
        {
            name: 'Nawazish Niyazi',
            role: 'Full Stack Developer',
            image: 'https://ui-avatars.com/api/?name=Nawazish+Niyazi&background=10b981&color=fff&size=200',
            github: 'https://github.com/nawazish-niyazi',        // <-- Paste link here
            linkedin: 'https://linkedin.com/in/nawazish-niyazi',  // <-- Paste link here
            email: 'nawazishniyazi0@gmail.com'             // <-- Paste link here
        },
        {
            name: 'Piyush Brambhhankar',
            role: 'Backend Developer',
            image: 'https://ui-avatars.com/api/?name=Piyush+Brambhhankar&background=3b82f6&color=fff&size=200',
            github: 'https://github.com/Piyush-Inovation',        // <-- Paste link here
            linkedin: 'https://www.linkedin.com/in/piyush-bramhankar-a041b638b/',  // <-- Paste link here
            email: 'mailto:your.email@example.com'             // <-- Paste link here
        },
        {
            name: 'Nainshi Roy',
            role: 'Frontend Developer',
            image: 'https://ui-avatars.com/api/?name=Nainshi+Roy&background=eab308&color=fff&size=200',
            github: 'https://github.com/nainshi-11',        // <-- Paste link here
            linkedin: 'https://www.linkedin.com/in/nainshi-roy-2b8310256/',  // <-- Paste link here
            email: 'roynainshi85@gmail.com'             // <-- Paste link here
        },
        {
            name: 'Bishnu Prasad Sahu',
            role: 'AI / ML Engineer',
            image: 'https://ui-avatars.com/api/?name=Bishnu+Prasad+sahu&background=f43f5e&color=fff&size=200',
            github: 'https://github.com/mebishnusahu0595',        // <-- Paste link here
            linkedin: 'https://www.linkedin.com/in/mebishnusahu05/',  // <-- Paste link here
            email: 'mailto:your.email@example.com'             // <-- Paste link here
        },
        {
            name: 'Antra Sharma',
            role: 'UI/UX Designer',
            image: 'https://ui-avatars.com/api/?name=Antra+Sharma&background=8b5cf6&color=fff&size=200',
            github: 'https://github.com/antrasharma15',        // <-- Paste link here
            linkedin: 'https://www.linkedin.com/in/antra-sharma15/',  // <-- Paste link here
            email: 'mailto:your.email@example.com'             // <-- Paste link here
        }
    ];

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-16 sm:pt-24 pb-8 sm:pb-12">
                <div className="container mx-auto px-2 sm:px-4 max-w-7xl">

                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ scale: 0, rotate: 180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 150 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mb-6 shadow-2xl"
                        >
                            <FaUsers className="text-white text-4xl" />
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-2 sm:mb-4"
                        >
                            Meet Our Team
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-4"
                        >
                            The brilliant minds behind FarmView AI, working tirelessly to revolutionize Indian agriculture through technology.
                        </motion.p>
                    </div>

                    {/* Team Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-8">
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: 0.4 + (index * 0.1),
                                    type: 'spring',
                                    stiffness: 100
                                }}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
                            >
                                {/* Profile Image */}
                                <div className="relative pt-8 pb-4 px-6 flex justify-center">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg ring-4 ring-primary-50 group-hover:ring-primary-200 transition-all">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="text-center px-6 pb-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                                    <p className="text-primary-600 font-medium text-sm mb-6">{member.role}</p>

                                    {/* Social Links */}
                                    <div className="flex justify-center space-x-4 opacity-70 group-hover:opacity-100 transition-opacity">
                                        <a href={member.github || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                                            <FaGithub className="text-lg" />
                                        </a>
                                        <a href={member.linkedin || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                            <FaLinkedin className="text-lg" />
                                        </a>
                                        <a href={member.email ? (member.email.startsWith('mailto:') ? member.email : `mailto:${member.email}`) : '#'} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
                                            <FaEnvelope className="text-lg" />
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
            <Footer />
        </>
    );
}
