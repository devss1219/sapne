import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Home, Car, Bike, Ban, Wallet, TrendingUp, HeartPulse, Download } from 'lucide-react';
import { toPng } from 'html-to-image';

export default function App() {
  // Global Body Background Fix
  useEffect(() => {
    document.body.style.backgroundColor = '#0a0a0a';
    document.documentElement.style.backgroundColor = '#0a0a0a';
  }, []);

  // Dashboard Name State & Ref for capturing image
  const [dashboardName, setDashboardName] = useState('Shobhit');
  const dashboardRef = useRef(null);

  // Core Cashflow State
  const [salary, setSalary] = useState(70000);
  const [personalExp, setPersonalExp] = useState(20000);
  const [medicalExp, setMedicalExp] = useState(7000);

  // Loan State
  const [loanType, setLoanType] = useState('home');
  const [loanAmount, setLoanAmount] = useState(2400000);
  const [tenure, setTenure] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);

  // Calculated EMI & Chart State
  const [loanEmi, setLoanEmi] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);

  // EMI Calculation Formula
  useEffect(() => {
    if (loanType === 'none' || loanAmount === 0 || tenure === 0) {
      setLoanEmi(0);
      return;
    }

    const P = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenure * 12;

    let emi = 0;
    if (r === 0) {
      emi = P / n;
    } else {
      emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }
    setLoanEmi(Math.round(emi));
  }, [loanAmount, tenure, interestRate, loanType]);

  // Handle Loan Toggles to set defaults
  const handleLoanSelect = (type) => {
    setLoanType(type);
    switch (type) {
      case 'home':
        setLoanAmount(2400000);
        setTenure(20);
        setInterestRate(8.5);
        break;
      case 'car':
        setLoanAmount(800000);
        setTenure(5);
        setInterestRate(8.5);
        break;
      case 'bike':
        setLoanAmount(150000);
        setTenure(3);
        setInterestRate(8.5);
        break;
      case 'none':
        setLoanAmount(0);
        setTenure(0);
        setInterestRate(0);
        break;
      default:
        break;
    }
  };

  const getSliderConfig = () => {
    switch (loanType) {
      case 'home': return { min: 100000, max: 20000000, step: 100000 };
      case 'car': return { min: 50000, max: 5000000, step: 50000 };
      case 'bike': return { min: 10000, max: 1000000, step: 10000 };
      default: return { min: 10000, max: 20000000, step: 10000 };
    }
  };
  const sliderConfig = getSliderConfig();

  const formatInr = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Cashflow Totals
  const totalKharche = loanEmi + personalExp + medicalExp;
  const bachat = salary - totalKharche;
  const savingsRate = salary > 0 ? ((bachat / salary) * 100).toFixed(1) : 0;

  // Ideal 50-30-20 Rule Data
  const pieData = [
    { name: 'Zaruratein', shortName: 'Zaruratein (50%)', value: salary * 0.5, color: '#93c5fd', target: 50 },
    { name: 'Lifestyle', shortName: 'Lifestyle (30%)', value: salary * 0.3, color: '#4ade80', target: 30 },
    { name: 'Savings', shortName: 'Savings (20%)', value: salary * 0.2, color: '#facc15', target: 20 },
  ];

  const activeSegment = activeIndex !== null ? pieData[activeIndex] : null;

  // Save Dashboard as Image Function (Fixed Cropping Issue)
  const saveDashboardAsImage = async () => {
    if (!dashboardRef.current) return;

    try {
      const node = dashboardRef.current;

      // Explicitly calculate scroll width/height to prevent right/bottom clipping
      const width = node.scrollWidth;
      const height = node.scrollHeight;

      const dataUrl = await toPng(node, {
        backgroundColor: '#0a0a0a',
        pixelRatio: 2,
        cacheBust: true,
        width: width,
        height: height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          margin: '0', // Resets margin to avoid alignment shift in export
        },
        filter: (n) => {
          return n.id !== 'save-controls';
        }
      });

      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = dataUrl;

      const fileName = dashboardName.trim() ? `${dashboardName.replace(/\s+/g, '_')}_Dashboard.png` : 'FinDash_Dashboard.png';
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to save dashboard image:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-4 md:p-6 font-sans selection:bg-blue-500/30 flex flex-col justify-center">

      <style>{`
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
        .hide-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Added ref here to capture this entire container */}
      <div ref={dashboardRef} className="max-w-7xl mx-auto w-full p-4 md:p-6">

        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              FinDash <span className="text-blue-500">.</span>
            </h1>
            <p className="text-gray-400 mt-1 text-xs md:text-sm">Interactive cashflow and custom loan configurator.</p>
          </div>

          <div id="save-controls" className="flex items-center gap-2 bg-[#12141a] p-2 rounded-lg border border-gray-800">
            <input
              type="text"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              placeholder="Dashboard Name..."
              className="bg-[#1a1d27] text-white text-sm px-3 py-1.5 rounded-md border border-gray-700 outline-none focus:border-blue-500 w-32 md:w-48 transition-colors"
            />
            <button
              onClick={saveDashboardAsImage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={16} /> Save
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: 50-30-20 Donut Chart */}
          <div className="lg:col-span-5 bg-[#12141a] rounded-3xl p-5 md:p-6 border border-gray-800/50 shadow-2xl flex flex-col items-center justify-center relative">
            <h2 className="text-lg font-semibold mb-4 text-gray-200 self-start w-full">Ideal 50-30-20 Split</h2>

            <div className="relative w-full h-56 md:h-64">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                {activeSegment ? (
                  <>
                    <span className="text-xs font-medium tracking-wide mb-1" style={{ color: activeSegment.color }}>
                      {activeSegment.name}
                    </span>
                    <span className="text-white text-2xl md:text-3xl font-bold">
                      {formatInr(activeSegment.value)}
                    </span>
                    <span className="text-gray-400 text-xs font-medium mt-1">
                      {activeSegment.target}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-400 text-xs font-medium tracking-wide mb-1">
                      Total Income
                    </span>
                    <span className="text-white text-2xl md:text-3xl font-bold">
                      {formatInr(salary)}
                    </span>
                  </>
                )}
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius="75%"
                    outerRadius="95%"
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={8}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {pieData.map((entry, index) => {
                      const isHovered = activeIndex === index;
                      const isAnyHovered = activeIndex !== null;
                      const fillOpacity = isAnyHovered && !isHovered ? 0.3 : 1;

                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          fillOpacity={fillOpacity}
                          className="transition-all duration-300 ease-in-out outline-none"
                        />
                      );
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap justify-center gap-3 md:gap-5 mt-6">
              {pieData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 cursor-pointer transition-opacity duration-200"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  style={{ opacity: activeIndex !== null && activeIndex !== idx ? 0.4 : 1 }}
                >
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs md:text-sm font-medium text-gray-300">{item.shortName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Cashflow & Loan Adjuster */}
          <div className="lg:col-span-7 bg-[#12141a] rounded-3xl p-5 md:p-6 border border-gray-800/50 shadow-2xl">
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 pb-6 border-b border-gray-800/80">
              <div className="text-center md:text-left border-r border-gray-800">
                <p className="text-lg md:text-2xl font-bold text-white mb-0.5">{formatInr(totalKharche)}</p>
                <p className="text-[10px] md:text-xs text-gray-400">Total Kharche</p>
              </div>
              <div className="text-center md:text-left border-r border-gray-800 pl-2 md:pl-4">
                <p className={`text-lg md:text-2xl font-bold mb-0.5 ${bachat >= 0 ? 'text-[#4ade80]' : 'text-red-500'}`}>
                  {formatInr(bachat)}
                </p>
                <p className="text-[10px] md:text-xs text-gray-400">Extra Bachat</p>
              </div>
              <div className="text-center md:text-left pl-2 md:pl-4">
                <p className={`text-lg md:text-2xl font-bold mb-0.5 ${savingsRate >= 20 ? 'text-white' : 'text-yellow-500'}`}>
                  {savingsRate}%
                </p>
                <p className="text-[10px] md:text-xs text-gray-400">Savings Rate</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="flex items-center gap-1.5 text-gray-300 font-medium text-xs md:text-sm">
                      <Wallet size={14} className="text-white" /> Monthly Salary
                    </label>
                    <div className="bg-[#1a1d27] border border-gray-700 px-2 py-0.5 rounded-md text-white font-mono text-xs md:text-sm">
                      {formatInr(salary)}
                    </div>
                  </div>
                  <input type="range" min="30000" max="250000" step="1000" value={salary} onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="flex items-center gap-1.5 text-gray-300 font-medium text-xs md:text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]"></div> Ghar & Personal
                    </label>
                    <div className="bg-[#1a1d27] border border-gray-700 px-2 py-0.5 rounded-md text-white font-mono text-xs">
                      {formatInr(personalExp)}
                    </div>
                  </div>
                  <input type="range" min="0" max="150000" step="1000" value={personalExp} onChange={(e) => setPersonalExp(Number(e.target.value))}
                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#4ade80]" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="flex items-center gap-1.5 text-gray-300 font-medium text-xs md:text-sm">
                      <HeartPulse size={12} className="text-[#facc15]" /> Medical Fund
                    </label>
                    <div className="bg-[#1a1d27] border border-gray-700 px-2 py-0.5 rounded-md text-white font-mono text-xs">
                      {formatInr(medicalExp)}
                    </div>
                  </div>
                  <input type="range" min="0" max="50000" step="500" value={medicalExp} onChange={(e) => setMedicalExp(Number(e.target.value))}
                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#facc15]" />
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Loan Configurator</h3>

                <div className="hide-scroll flex bg-[#12141a] p-1 rounded-lg border border-gray-800 overflow-x-auto w-full md:w-auto">
                  <button onClick={() => handleLoanSelect('home')} className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center justify-center gap-1 transition-colors flex-1 md:flex-none ${loanType === 'home' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}><Home size={12} /> Home</button>
                  <button onClick={() => handleLoanSelect('car')} className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center justify-center gap-1 transition-colors flex-1 md:flex-none ${loanType === 'car' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}><Car size={12} /> Car</button>
                  <button onClick={() => handleLoanSelect('bike')} className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center justify-center gap-1 transition-colors flex-1 md:flex-none ${loanType === 'bike' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}><Bike size={12} /> Bike</button>
                  <button onClick={() => handleLoanSelect('none')} className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center justify-center gap-1 transition-colors flex-1 md:flex-none ${loanType === 'none' ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-gray-200'}`}><Ban size={12} /> None</button>
                </div>
              </div>

              {loanType !== 'none' ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-gray-300 font-medium text-xs">Loan Amount (Principal)</label>
                      <div className="bg-[#12141a] border border-gray-700 px-2 py-0.5 rounded-md text-white font-mono text-xs">
                        {formatInr(loanAmount)}
                      </div>
                    </div>
                    <input
                      type="range"
                      min={sliderConfig.min}
                      max={sliderConfig.max}
                      step={sliderConfig.step}
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-gray-300 font-medium text-xs">Tenure (Years)</label>
                        <span className="text-gray-300 font-mono text-xs">{tenure} Yrs</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={tenure}
                        onChange={(e) => setTenure(Number(e.target.value))}
                        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-gray-300 font-medium text-xs">Interest Rate (%)</label>
                        <span className="text-gray-300 font-mono text-xs">{interestRate}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="20"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-2 p-3 bg-[#12141a] border border-[#ef4444]/30 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#ef4444]/10 flex items-center justify-center text-[#ef4444]">
                        <TrendingUp size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-300">Calculated EMI</p>
                        <p className="text-[10px] text-gray-500">Added to Total Kharche</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-[#ef4444]">{formatInr(loanEmi)}</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center border border-dashed border-gray-800 rounded-xl">
                  <p className="text-gray-500 text-xs">No active loans. You are debt-free!</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}