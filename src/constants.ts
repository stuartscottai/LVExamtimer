// Cambridge exam data constants with papers and durations

import { Exam } from './types';

export const CENTRE_NUMBER = 'ES750';

export const CAMBRIDGE_EXAMS: Exam[] = [
  {
    name: "A1 Starters",
    papers: [
      { name: "Reading & Writing", durationMinutes: 20 },
      { name: "Listening", durationMinutes: 20, isListening: true }
    ]
  },
  {
    name: "A1 Movers",
    papers: [
      { name: "Reading & Writing", durationMinutes: 30 },
      { name: "Listening", durationMinutes: 25, isListening: true }
    ]
  },
  {
    name: "A2 Flyers",
    papers: [
      { name: "Reading & Writing", durationMinutes: 40 },
      { name: "Listening", durationMinutes: 25, isListening: true }
    ]
  },
  {
    name: "A2 Key",
    papers: [
      { name: "Reading & Writing", durationMinutes: 60 },
      { name: "Listening", durationMinutes: 30, isListening: true }
    ]
  },
  {
    name: "A2 Key for Schools",
    papers: [
      { name: "Reading & Writing", durationMinutes: 60 },
      { name: "Listening", durationMinutes: 30, isListening: true }
    ]
  },
  {
    name: "B1 Preliminary",
    papers: [
      { name: "Reading", durationMinutes: 45 },
      { name: "Writing", durationMinutes: 45 },
      { name: "Listening", durationMinutes: 30, isListening: true }
    ]
  },
  {
    name: "B1 Preliminary for Schools",
    papers: [
      { name: "Reading", durationMinutes: 45 },
      { name: "Writing", durationMinutes: 45 },
      { name: "Listening", durationMinutes: 30, isListening: true }
    ]
  },
  {
    name: "B2 First Certificate",
    papers: [
      { name: "Reading & Use of English", durationMinutes: 75 },
      { name: "Writing", durationMinutes: 80 },
      { name: "Listening", durationMinutes: 40, isListening: true }
    ]
  },
  {
    name: "B2 First Certificate for Schools",
    papers: [
      { name: "Reading & Use of English", durationMinutes: 75 },
      { name: "Writing", durationMinutes: 80 },
      { name: "Listening", durationMinutes: 40, isListening: true }
    ]
  },
  {
    name: "C1 Advanced",
    papers: [
      { name: "Reading & Use of English", durationMinutes: 90 },
      { name: "Writing", durationMinutes: 90 },
      { name: "Listening", durationMinutes: 40, isListening: true }
    ]
  },
  {
    name: "C2 Proficiency",
    papers: [
      { name: "Reading & Use of English", durationMinutes: 90 },
      { name: "Writing", durationMinutes: 90 },
      { name: "Listening", durationMinutes: 40, isListening: true }
    ]
  }
];