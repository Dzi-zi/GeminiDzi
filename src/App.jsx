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
      </Routes>
    </div>
  )
}

export default App