import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);

const AnalyticsDashboard = ({ lists }) => {
  // Remove duplicate users by UID or email
  const uniqueLists = lists.filter((user, idx, arr) =>
    arr.findIndex(u => (u.uid || u.email) === (user.uid || user.email)) === idx
  );
  const getAnalytics = () => {
    const userStats = uniqueLists.map(user => {
      const total = (user.tasks || []).length;
      const completed = (user.tasks || []).filter(t => t.completed).length;
      const overdue = (user.tasks || []).filter(t => t.deadline && new Date(t.deadline) < new Date() && !t.completed).length;
      return { name: user.name, total, completed, overdue };
    });
    const mostActive = [...userStats].sort((a,b) => b.completed - a.completed)[0];
    const leaderboard = [...userStats].sort((a,b) => b.completed - a.completed).slice(0,5);
    const overdueTotal = userStats.reduce((acc, u) => acc + u.overdue, 0);
    const totalTasks = userStats.reduce((acc, u) => acc + u.total, 0);
    const completedTasks = userStats.reduce((acc, u) => acc + u.completed, 0);
    return { userStats, mostActive, leaderboard, overdueTotal, totalTasks, completedTasks };
  };
  const analytics = getAnalytics();
  let pieData;
  if (analytics.totalTasks === 0) {
    pieData = {
      labels: ['No Data'],
      datasets: [
        {
          data: [1],
          backgroundColor: ['#888'],
          borderWidth: 1,
        },
      ],
    };
  } else {
    pieData = {
      labels: ['Completed', 'Incomplete'],
      datasets: [
        {
          data: [analytics.completedTasks, analytics.totalTasks - analytics.completedTasks],
          backgroundColor: ['#44ff44', '#ff4444'],
          borderWidth: 1,
        },
      ],
    };
  }
  return (
    <div className="admin-analytics" style={{margin:'2em 0',padding:'1.5em',background:'#181818',borderRadius:'16px',boxShadow:'0 2px 16px #0003',color:'#fff',maxWidth:'900px',marginLeft:'auto',marginRight:'auto'}}>
      <h2 style={{marginBottom:'1em',fontSize:'1.5em',fontWeight:700,letterSpacing:'-1px'}}>Admin Analytics Dashboard</h2>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'2em',alignItems:'center',justifyItems:'center',flexWrap:'wrap'}}>
        <div style={{textAlign:'left',width:'100%'}}>
          <div style={{fontWeight:600,marginBottom:'0.5em'}}>Most Active User:</div>
          <div style={{marginBottom:'1em'}}>{analytics.mostActive?.name || '-'}</div>
          <div style={{fontWeight:600,marginBottom:'0.5em'}}>Overdue Tasks:</div>
          <div style={{marginBottom:'1em'}}>{analytics.overdueTotal}</div>
          <div style={{fontWeight:600,marginBottom:'0.5em'}}>Completion Rate:</div>
          <div>{analytics.totalTasks > 0 ? Math.round((analytics.completedTasks/analytics.totalTasks)*100) : 0}%</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'0.5em'}}>
          <Pie data={pieData} options={{plugins:{legend:{display:false}}}} />
          <div style={{display:'flex',gap:'1em',marginTop:'0.5em',fontSize:'0.95em'}}>
            {analytics.totalTasks === 0 ? (
              <span style={{color:'#888'}}>No data</span>
            ) : (
              <>
                <span style={{display:'flex',alignItems:'center',gap:'0.3em'}}><span style={{width:12,height:12,background:'#44ff44',display:'inline-block',borderRadius:2}}></span>Completed</span>
                <span style={{display:'flex',alignItems:'center',gap:'0.3em'}}><span style={{width:12,height:12,background:'#ff4444',display:'inline-block',borderRadius:2}}></span>Incomplete</span>
              </>
            )}
          </div>
        </div>
        <div style={{textAlign:'left',width:'100%'}}>
          <div style={{fontWeight:600,marginBottom:'0.5em'}}>Leaderboard</div>
          <ol style={{margin:'0.5em 0 0 1em',padding:0,fontSize:'1em',lineHeight:'1.7'}}>
            {analytics.leaderboard.map((u,i) => <li key={u.name+i}>{u.name}: <span style={{fontWeight:600}}>{u.completed}</span> completed</li>)}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 