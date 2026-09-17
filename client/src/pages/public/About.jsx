import React from 'react';
import { HeartPulse, Target, Users, ShieldAlert } from 'lucide-react';

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
          <HeartPulse size={28} />
        </span>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">About LifeLink</h1>
        <p className="mt-3 text-slate-600">
          LifeLink is a smart emergency healthcare coordination platform built for Bengaluru, Karnataka.
          It connects patients, hospitals, ambulance drivers, and administrators so emergency resources
          can be found and coordinated faster.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="card">
          <Target className="text-brand-600" size={24} />
          <h2 className="mt-3 font-semibold text-slate-900">The Problem</h2>
          <p className="mt-1.5 text-sm text-slate-600">
            During emergencies, patients and attendants often waste critical time calling around to find
            hospitals with available beds, ICU units, ventilators, or emergency facilities, and separately
            searching for an ambulance.
          </p>
        </div>
        <div className="card">
          <Users className="text-teal-600" size={24} />
          <h2 className="mt-3 font-semibold text-slate-900">The Solution</h2>
          <p className="mt-1.5 text-sm text-slate-600">
            LifeLink lets a patient report an emergency once, then automatically matches nearby hospitals
            by specialization, live capacity, and distance, while making it easy to request the nearest
            available ambulance and track the response in real time.
          </p>
        </div>
      </div>

      <div className="card mt-8">
        <h2 className="font-semibold text-slate-900">How Recommendations Work</h2>
        <p className="mt-2 text-sm text-slate-600">
          LifeLink uses a transparent, rule-based scoring system — not machine learning — to rank hospitals:
          specialization match (50%), resource availability (30%), and distance from the patient (20%),
          calculated using the Haversine formula. AI-based demand forecasting is noted as a possible future
          enhancement but is not part of this version.
        </p>
      </div>

      <div className="card mt-8 border-l-4 border-emergency-500">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 shrink-0 text-emergency-500" size={22} />
          <div>
            <h2 className="font-semibold text-slate-900">Demo Disclaimer</h2>
            <p className="mt-1.5 text-sm text-slate-600">
              This is a college-project demonstration. Hospital names, capacities, and ambulance data are
              fictional and used only for development and presentation purposes. LifeLink is not connected
              to real hospitals or emergency services. In a real emergency in India, please call 108 or 112.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
