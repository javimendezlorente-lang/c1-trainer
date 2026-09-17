import PracticeControls from '../components/PracticeControls'
import MultipleChoice from '../components/MultipleChoice'
import MatchPairs from '../components/MatchPairs'
import FillBlanks from '../components/FillBlanks'
import { usePracticeStore } from '../store/practiceStore'
import './Practice.css'

export default function Practice() {
  const { currentMode } = usePracticeStore()

  const renderPracticeMode = () => {
    switch (currentMode) {
      case 'multiple-choice':
        return <MultipleChoice />
      case 'match-pairs':
        return <MatchPairs />
      case 'fill-blanks':
        return <FillBlanks />
      default:
        return null
    }
  }

  return (
    <div className="practice-page">
      <div className="practice-content">
        {/* Left sidebar: All controls and stats */}
        <div className="practice-sidebar">
          <PracticeControls />
        </div>

        {/* Right side: Practice mode content */}
        <main className="practice-main">
          {renderPracticeMode()}
        </main>
      </div>
    </div>
  )
}
