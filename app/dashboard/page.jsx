// "use client";

// import React, { useEffect, useState } from 'react'
// import { toast } from "sonner";
// import {
//   Bot,
//   Plus,
//   ListChecks,
//   Trophy,
//   Zap,
//   TrendingUp 
// } from "lucide-react";
// import { useRouter } from "next/navigation";

// import AddNewInterview from './_components/AddNewInterview'
// import InterviewList from './_components/InterviewList'
// import { useCurrentUser } from "@/lib/auth-storage";

// function Dashboard() {
//   const router = useRouter();

//   const { user, isReady } = useCurrentUser();   //custom hook login in user ka 
//   // data layega aur isReady se pata chalega ki user data load ho chuka hai ya nahi

//   const [interviewData, setInterviewData] = useState([]);

//   const [isNewInterviewModalOpen, setIsNewInterviewModalOpen] = useState(false);
//   // is new interview modal open hai ya nahi ye state manage karega

//   const [statsCards, setStatsCards] = useState([
//     {
//       icon: <ListChecks size={32} className="text-indigo-600" />,
//       title: "Total Interviews",
//       value: "0"
//     },
//     {
//       icon: <Trophy size={32} className="text-green-600" />,
//       title: "Best Score",
//       value: "N/A"
//     },
//     {
//       icon: <TrendingUp size={32} className="text-blue-600" />,
//       title: "Improvement Rate",
//       value: "0%"
//     }
//   ]);

//   const fetchInterviews = async () => { // interview data fetch karne ke liye API call karenge
//     if (!user?.email) {
//       toast.error("User email not found");
//       return;
//     }

//     try {
//       const response = await fetch('/api/fetchUserData', {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           userEmail: user.email
//         })
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to fetch interview data');
//       }
  
//       const data = await response.json();
      
//       // Filter interviews specific to the current user's email
//       const userSpecificInterviews = data.userAnswers.filter(
//         interview => interview.userEmail === user.email
//       );

//       setInterviewData(userSpecificInterviews);

//       // Calculate and update stats
//       const totalInterviews = userSpecificInterviews.length;
//       const bestScore = totalInterviews > 0 
//         ? Math.max(...userSpecificInterviews.map(item => parseInt(item.rating || '0')))
//         : 0;
//       const improvementRate = calculateImprovementRate(userSpecificInterviews);

//       setStatsCards([
//         {
//           ...statsCards[0],
//           value: totalInterviews.toString()
//         },
//         {
//           ...statsCards[1],
//           value: bestScore ? `${bestScore}/10` : 'N/A'
//         },
//         {
//           ...statsCards[2],
//           value: `${improvementRate}%`
//         }
//       ]);

//       if (totalInterviews > 0) {
//         toast.success(`Loaded ${totalInterviews} interview(s)`);
//       }

//     } catch (error) {
//       console.error('Error fetching interviews:', error);
//       toast.error(error.message || 'Failed to fetch interviews');
//     }
//   };

//   const calculateImprovementRate = (interviews) => {
//     if (interviews.length <= 1) return 0;
    
//     const scores = interviews
//       .map(interview => parseInt(interview.rating || '0'))
//       .sort((a, b) => a - b);
    
//     const improvement = ((scores[scores.length - 1] - scores[0]) / scores[0]) * 100;
//     return Math.round(improvement);
//   };

//   useEffect(() => {
//     if (isReady && !user?.email) {
//       router.replace('/sign-in');
//     }

//     if (user?.email) {
//       fetchInterviews();
//     }
//   }, [user, isReady, router]);

//   if (!isReady || !user?.email) {
//     return (
//       <div className="flex min-h-[60vh] items-center justify-center">
//         <p className="text-gray-500">Loading dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-7xl">
//       {/* User Greeting */}
//       <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
//         <div>
//           <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
//             <Bot className="text-indigo-600" size={32} />
//             Dashboard
//           </h2>
//           <h3 className="text-lg sm:text-xl text-gray-600 mt-2">
//             Welcome, {user?.firstName || user?.name || 'Interviewer'}
//           </h3>
//         </div>
//         <div className="flex items-center gap-4">
//           <span className="text-gray-500 text-sm sm:text-base">
//             {user.email}
//           </span>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
//         {statsCards.map((card) => (
//           <div 
//             key={card.title}
//             className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center"
//           >
//             {card.icon}
//             <div className="ml-4">
//               <p className="text-xs sm:text-sm text-gray-500">{card.title}</p>
//               <p className="text-xl sm:text-2xl font-bold text-gray-800">{card.value}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Interview Section */}
//       <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
//         <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0">
//           <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center gap-3">
//             <Zap size={24} className="text-yellow-500" />
//             Create AI Mock Interview
//           </h2>

// {/* -------------------------------------------------------------------------- */}
//           <button 
//             onClick={() => setIsNewInterviewModalOpen(true)}
//             className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors"
//           >
//             <Plus size={20} className="mr-2" />
//             New Interview
//           </button> 
//             {/* New Interview button pe click karne se AddNewInterview component ka
//              modal open hoga jisme user apne job details fill karke new interview create kar sakta hai */}

// {/* -------------------------------------------------------------------------- */}
//         </div>

//         {/* Add New Interview Component */}
//         <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
//           <AddNewInterview   //component call kar rahe hain jisme interview create karne ka form hoga
//             isOpen={isNewInterviewModalOpen} 
//             onOpen={() => setIsNewInterviewModalOpen(true)}
//             onClose={() => setIsNewInterviewModalOpen(false)} 
//             currentUser={user}
//           />
//         </div>
//       </div>

//      {/* Interview History */}
//      <div className="mt-8">
//         <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
//           Interview History
//         </h2>
//         <InterviewList interviews={interviewData} currentUser={user} />
//       </div>
//     </div>
//   );
// }

// export default Dashboard;


"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Bot,
  Plus,
  ListChecks,
  Trophy,
  Zap,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";
import { useCurrentUser } from "@/lib/auth-storage";

function Dashboard() {
  const router = useRouter();

  const { user, isReady } = useCurrentUser(); // custom hook to get current user data and check if it's ready

  const [interviewData, setInterviewData] = useState([]);

  const [isNewInterviewModalOpen, setIsNewInterviewModalOpen] =
    useState(false);

  const [statsCards, setStatsCards] = useState([
    {
      icon: <ListChecks size={32} className="text-indigo-600" />,
      title: "Total Interviews",
      value: "0",
    },
    {
      icon: <Trophy size={32} className="text-green-600" />,
      title: "Best Score",
      value: "N/A",
    },
    {
      icon: <TrendingUp size={32} className="text-blue-600" />,
      title: "Improvement Rate",
      value: "0%",
    },
  ]);

  const calculateImprovementRate = (interviews) => {
    if (interviews.length < 2) return 0;

    const scores = interviews
      .map((item) => Number(item.rating || 0))
      .filter((score) => score > 0);

    if (scores.length < 2) return 0;

    const first = scores[0];
    const last = scores[scores.length - 1];

    if (first === 0) return 0;

    return Math.round(((last - first) / first) * 100);
  };

  const fetchInterviews = async () => {
    if (!user?.email) return;

    try {
      const response = await fetch(
        `/api/interviews?email=${encodeURIComponent(user.email)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch interviews");
      }

      const data = await response.json();

      const interviews = data.interviews || [];

      setInterviewData(interviews);

      const totalInterviews = interviews.length;

      const ratings = interviews
        .map((item) => Number(item.rating || 0))
        .filter((rating) => rating > 0);

      const bestScore =
        ratings.length > 0 ? Math.max(...ratings) : null;

      const improvementRate =
        calculateImprovementRate(interviews);

      setStatsCards([
        {
          icon: <ListChecks size={32} className="text-indigo-600" />,
          title: "Total Interviews",
          value: totalInterviews.toString(),
        },
        {
          icon: <Trophy size={32} className="text-green-600" />,
          title: "Best Score",
          value: bestScore ? `${bestScore}/10` : "N/A",
        },
        {
          icon: <TrendingUp size={32} className="text-blue-600" />,
          title: "Improvement Rate",
          value: `${improvementRate}%`,
        },
      ]);

      console.log("Total Interviews:", totalInterviews);

    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast.error(error.message || "Failed to fetch interviews");
    }
  };

  useEffect(() => {
    if (isReady && !user?.email) {
      router.replace("/sign-in");
    }

    if (user?.email) {
      fetchInterviews();
    }
  }, [user, isReady]);

  if (!isReady || !user?.email) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* User Greeting */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Bot className="text-indigo-600" size={32} />
            Dashboard
          </h2>

          <h3 className="text-lg sm:text-xl text-gray-600 mt-2">
            Welcome,{" "}
            {user?.firstName || user?.name || "Interviewer"}
          </h3>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm sm:text-base">
            {user.email}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {statsCards.map((card) => (
          <div
            key={card.title}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center"
          >
            {card.icon}

            <div className="ml-4">
              <p className="text-xs sm:text-sm text-gray-500">
                {card.title}
              </p>

              <p className="text-xl sm:text-2xl font-bold text-gray-800">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Create Interview */}
      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center gap-3">
            <Zap size={24} className="text-yellow-500" />
            Create AI Mock Interview
          </h2>
{/* -------------------------------------------------------------------------------------------- */}
          <button
            onClick={() => setIsNewInterviewModalOpen(true)}
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            New Interview
          </button>
        </div>
{/* ------------------------------------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <AddNewInterview
            isOpen={isNewInterviewModalOpen}
            onOpen={() => setIsNewInterviewModalOpen(true)}
            onClose={() => setIsNewInterviewModalOpen(false)}
            currentUser={user}
          />
        </div>
      </div>

      {/* Interview History */}
      <div className="mt-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
          Interview History
        </h2>

        <InterviewList
          interviews={interviewData}
          currentUser={user}
        />
      </div>
    </div>
  );
}

export default Dashboard;