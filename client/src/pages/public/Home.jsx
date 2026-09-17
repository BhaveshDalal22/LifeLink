import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Siren, MapPinned, Ambulance, Activity, ClipboardList, LayoutDashboard,
  ArrowRight, HeartPulse, BedDouble, Building2, ShieldCheck
} from 'lucide-react';
import { hospitalService } from '../../services/hospitalService';

const FEATURES = [
  { icon: Activity, title: 'Real-Time Hospital Capacity', desc: 'Live bed, ICU, and ventilator availability updated directly by hospital staff.' },
  { icon: MapPinned, title: 'Nearby Hospital Matching', desc: 'Rule-based matching by specialization, resource availability, and distance.' },
  { icon: Ambulance, title: 'Emergency Ambulance Coordination', desc: 'Find and request the nearest available ambulance in a few taps.' },
  { icon: Siren, title: 'Live Emergency Tracking', desc: 'Track your emergency from report to hospital arrival, step by step.' },
  { icon: ClipboardList, title: 'Hospital Resource Management', desc: 'Hospitals manage beds, ICU, ventilators, and incoming requests in one place.' },
  { icon: LayoutDashboard, title: 'Centralized Emergency Dashboard', desc: 'Admins monitor users, hospitals, ambulances, and emergencies platform-wide.' }
];

const STEPS = [
  { title: 'Report the Emergency', desc: 'Describe the emergency type, severity, and required resources in under a minute.' },
  { title: 'Get Matched to Hospitals', desc: 'LifeLink ranks nearby verified hospitals by specialization, capacity, and distance.' },
  { title: 'Request Ambulance & Admission', desc: 'Request the nearest ambulance and send an admission request with one click.' },
  { title: 'Track in Real Time', desc: 'Follow the ambulance and hospital response until the patient arrives safely.' }
];

export default function Home() {
  const [stats, setStats] = useState({ hospitals: 5, verified: 5, ambulances: 5 });

  useEffect(() => {
    hospitalService.getAll().then((res) => {
      const hospitals = res.data.hospitals || [];
      setStats((s) => ({ ...s, hospitals: hospitals.length, verified: hospitals.filter((h) => h.verified).length }));
    }).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-teal-600 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-100">
              <ShieldCheck size={14} /> Demo platform for Bengaluru, Karnataka
            </span>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              Find the Right Emergency Care, When Every Second Matters.
            </h1>
            <p className="mt-4 max-w-xl text-base text-brand-100 sm:text-lg">
              Connect with nearby hospitals, emergency resources, and available ambulances through one
              intelligent healthcare coordination platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/report-emergency" className="btn-emergency text-base px-6 py-3">
                <Siren size={18} /> Report Emergency
              </Link>
              <Link to="/find-hospital" className="btn text-base px-6 py-3 bg-white text-brand-700 hover:bg-brand-50">
                <MapPinned size={18} /> Find Nearby Hospitals
              </Link>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl bg-white/10 p-6 backdrop-blur">
              <div className="flex items-center gap-3 text-white">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <HeartPulse size={26} />
                </span>
                <div>
                  <p className="font-semibold">LifeLink Coordination</p>
                  <p className="text-xs text-brand-100">Patients • Hospitals • Ambulances • Admins</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div className="rounded-lg bg-white/10 px-4 py-3 text-sm">
                  <span className="font-semibold">Metro Life Hospital</span> — ICU: <span className="text-green-300">4 available</span>
                </div>
                <div className="rounded-lg bg-white/10 px-4 py-3 text-sm">
                  <span className="font-semibold">Ambulance KA-01-AB-1234</span> — <span className="text-yellow-300">3.2 km away</span>
                </div>
                <div className="rounded-lg bg-white/10 px-4 py-3 text-sm">
                  Emergency status: <span className="font-semibold text-teal-200">On the Way</span>
                </div>
              </div>
              <p className="mt-4 text-[11px] text-brand-200">Illustrative demo data shown for presentation only.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live stats */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:px-6 lg:grid-cols-4">
          <div className="card text-center">
            <Building2 className="mx-auto text-brand-600" size={22} />
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.hospitals}</p>
            <p className="text-xs text-slate-500">Partner Hospitals (demo)</p>
          </div>
          <div className="card text-center">
            <ShieldCheck className="mx-auto text-teal-600" size={22} />
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.verified}</p>
            <p className="text-xs text-slate-500">Verified Hospitals</p>
          </div>
          <div className="card text-center">
            <Ambulance className="mx-auto text-emergency-500" size={22} />
            <p className="mt-2 text-2xl font-bold text-slate-900">5</p>
            <p className="text-xs text-slate-500">Ambulances (demo fleet)</p>
          </div>
          <div className="card text-center">
            <BedDouble className="mx-auto text-brand-600" size={22} />
            <p className="mt-2 text-2xl font-bold text-slate-900">24/7</p>
            <p className="text-xs text-slate-500">Emergency Coordination</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">How It Works</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-500">
          Four simple steps from reporting an emergency to arriving safely at the right hospital.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="card">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">Platform Features</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <f.icon size={22} />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why LifeLink */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Why LifeLink</h2>
            <p className="mt-3 text-slate-600">
              During emergencies, minutes lost searching for available hospital beds or ambulances can
              change outcomes. LifeLink brings hospital capacity, ambulance availability, and emergency
              reporting onto a single coordinated platform, so patients and attendants spend less time
              searching and more time getting care.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2"><ArrowRight size={16} className="mt-0.5 text-brand-600" /> Rule-based hospital recommendations by specialization, resources, and distance.</li>
              <li className="flex items-start gap-2"><ArrowRight size={16} className="mt-0.5 text-brand-600" /> Live bed, ICU, and ventilator counts maintained directly by hospital staff.</li>
              <li className="flex items-start gap-2"><ArrowRight size={16} className="mt-0.5 text-brand-600" /> Nearest-ambulance matching with a simple, transparent trip status flow.</li>
              <li className="flex items-start gap-2"><ArrowRight size={16} className="mt-0.5 text-brand-600" /> Role-based access for patients, hospital staff, ambulance drivers, and admins.</li>
            </ul>
            <p className="mt-6 text-xs text-slate-400">
              Future scope: AI-based demand forecasting for proactive capacity planning (not implemented in this version).
            </p>
          </div>
          <div className="card bg-gradient-to-br from-brand-50 to-teal-50">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm">
                <span className="text-sm font-medium text-slate-700">Bengaluru Emergency Care Hospital</span>
                <span className="badge bg-green-100 text-green-700">Open</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm">
                <span className="text-sm font-medium text-slate-700">Metro Life Hospital</span>
                <span className="badge bg-yellow-100 text-yellow-800">Limited Capacity</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm">
                <span className="text-sm font-medium text-slate-700">Whitefield Emergency Centre</span>
                <span className="badge bg-green-100 text-green-700">Open</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emergency-500 py-14 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold sm:text-3xl">In an emergency, every second counts.</h2>
          <p className="mt-2 text-emergency-50">Report an emergency now to find the nearest suitable hospital and ambulance.</p>
          <Link to="/report-emergency" className="btn mt-6 bg-white text-emergency-600 hover:bg-red-50 px-6 py-3 text-base">
            <Siren size={18} /> Report Emergency
          </Link>
        </div>
      </section>
    </div>
  );
}
