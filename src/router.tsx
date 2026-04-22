import { createBrowserRouter } from 'react-router-dom'
import { LandingPage } from './pages/landing/LandingPage'
import { OnboardingPage } from './pages/onboarding/OnboardingPage'
import { HomePage } from './pages/home/HomePage'
import { FoundationsPage } from './pages/drill/FoundationsPage'
import { EasyPage } from './pages/drill/EasyPage'
import { MediumPage } from './pages/drill/MediumPage'
import { HardPage } from './pages/drill/HardPage'
import { ExpertPage } from './pages/drill/ExpertPage'
import { ScramblePage } from './pages/drill/ScramblePage'
import { WordOrderPage } from './pages/drill/WordOrderPage'
import { PassagePage } from './pages/drill/PassagePage'
import { AudioCuePage } from './pages/drill/AudioCuePage'
import { KnownPickPage } from './pages/review/KnownPickPage'
import { MixedReviewPage } from './pages/review/MixedReviewPage'
import { WeakSpotReviewPage } from './pages/review/WeakSpotReviewPage'
import { WhichSurahPage } from './pages/review/WhichSurahPage'
import { MeaningMatchPage } from './pages/review/MeaningMatchPage'
import { JuzEndingsPage } from './pages/review/JuzEndingsPage'
import { NextAyahPage } from './pages/review/NextAyahPage'
import { LocatePage } from './pages/review/LocatePage'
import { ConnectPage } from './pages/review/ConnectPage'
import { JudgePage } from './pages/judge/JudgePage'
import { ListenPage } from './pages/listen/ListenPage'
import { JuzListenPage } from './pages/listen/JuzListenPage'
import { WritePage } from './pages/drill/WritePage'
import { RecitePage } from './pages/drill/RecitePage'
import { EndingsPage } from './pages/drill/EndingsPage'
import { ContinuePage } from './pages/drill/ContinuePage'
import { SettingsPage } from './pages/settings/SettingsPage'
import { BookmarksPage } from './pages/bookmarks/BookmarksPage'

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/onboarding', element: <OnboardingPage /> },
  { path: '/home', element: <HomePage /> },
  { path: '/drill/foundations', element: <FoundationsPage /> },
  { path: '/drill/:surahId/easy', element: <EasyPage /> },
  { path: '/drill/:surahId/medium', element: <MediumPage /> },
  { path: '/drill/:surahId/hard', element: <HardPage /> },
  { path: '/drill/:surahId/expert', element: <ExpertPage /> },
  { path: '/drill/:surahId/scramble', element: <ScramblePage /> },
  { path: '/drill/:surahId/wordorder', element: <WordOrderPage /> },
  { path: '/drill/:surahId/passage', element: <PassagePage /> },
  { path: '/drill/:surahId/audio', element: <AudioCuePage /> },
  { path: '/review/pick', element: <KnownPickPage /> },
  { path: '/review/mixed', element: <MixedReviewPage /> },
  { path: '/review/weak', element: <WeakSpotReviewPage /> },
  { path: '/review/which-surah', element: <WhichSurahPage /> },
  { path: '/review/meaning', element: <MeaningMatchPage /> },
  { path: '/review/juz/:juz/endings', element: <JuzEndingsPage /> },
  { path: '/review/next', element: <NextAyahPage /> },
  { path: '/review/locate', element: <LocatePage /> },
  { path: '/review/connect', element: <ConnectPage /> },
  { path: '/judge/:surahId', element: <JudgePage /> },
  { path: '/listen/:surahId', element: <ListenPage /> },
  { path: '/listen/juz/:juz', element: <JuzListenPage /> },
  { path: '/drill/write', element: <WritePage /> },
  { path: '/drill/:surahId/recite', element: <RecitePage /> },
  { path: '/drill/:surahId/endings', element: <EndingsPage /> },
  { path: '/drill/:surahId/continue', element: <ContinuePage /> },
  { path: '/settings', element: <SettingsPage /> },
  { path: '/bookmarks', element: <BookmarksPage /> },
])
