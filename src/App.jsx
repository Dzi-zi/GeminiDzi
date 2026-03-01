import { Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation/Navigation'
import Landing   from './pages/Landing'
import Arcade    from './pages/Arcade/Arcade'
import GlamRoom  from './pages/GlamRoom/GlamRoom'
import MindGames from './pages/MindGames/MindGames'
import Lab       from './pages/Lab/Lab'
import Studio    from './pages/Studio/Studio'
import World     from './pages/World/World'
import OS        from './pages/OS/OS'
import Feed      from './pages/Feed/Feed'
import DocuChat from './pages/Lab/DocuChat/DocuChat'
import Quiz from './pages/Arcade/Quiz/Quiz'
import SplitEase from './pages/Lab/SplitEase/SplitEase'
import RhythmBeats from './pages/Arcade/RhythmBeats/RhythmBeats'
import VoidStriker from './pages/Arcade/VoidStriker/VoidStriker'
import GradeCalc from './pages/Lab/GradeCalc/GradeCalc'
import HealthPulse from './pages/Lab/HealthPulse/HealthPulse'
import AnimationStudio from './pages/Lab/AnimationStudio/AnimationStudio'
import NewsRoom from './pages/Lab/NewsRoom/NewsRoom'
import MoodTunes from './pages/Lab/MoodTunes/MoodTunes'
import WorldRunner from './pages/Arcade/WorldRunner/WorldRunner'
import SankofaCards from './pages/Arcade/SankofaCards/SankofaCards'

function App() {
  return (
    <div>
      <Navigation />
      <Routes>
        <Route path="/"          element={<Landing />}   />
        <Route path="/Arcade"    element={<Arcade />}    />
        <Route path="/GlamRoom"  element={<GlamRoom />}  />
        <Route path="/MindGames" element={<MindGames />} />
        <Route path="/Lab"       element={<Lab />}       />
        <Route path="/Studio"    element={<Studio />}    />
        <Route path="/World"     element={<World />}     />
        <Route path="/OS"        element={<OS />}        />
        <Route path="/Feed"      element={<Feed />}      />
        <Route path="/lab/docuchat" element={<DocuChat />} />
        <Route path="/arcade/quiz" element={<Quiz />} />
        <Route path="/lab/splitease" element={<SplitEase />} />
        <Route path="/arcade/rhythmbeats" element={<RhythmBeats />} />
        <Route path="/arcade/voidstriker" element={<VoidStriker />} />
        <Route path="/lab/gradecalc" element={<GradeCalc />} />
        <Route path="/lab/healthpulse" element={<HealthPulse />} />
        <Route path="/lab/animationstudio" element={<AnimationStudio />} />
        <Route path="/lab/newsroom" element={<NewsRoom />} />
        <Route path="/lab/moodtunes" element={<MoodTunes />} />
        <Route path="/arcade/worldrunner" element={<WorldRunner />} />
        <Route path="/arcade/sankofacards" element={<SankofaCards />} />
      </Routes>
    </div>
  )
}

export default App