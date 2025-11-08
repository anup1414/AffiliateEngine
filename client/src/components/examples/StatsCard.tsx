import StatsCard from '../StatsCard'
import { IndianRupee } from 'lucide-react'

export default function StatsCardExample() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard 
        title="Daily Earnings" 
        value="₹2,000" 
        icon={IndianRupee}
        trend="+1 referral today"
      />
      <StatsCard 
        title="7-Day Earnings" 
        value="₹8,000" 
        icon={IndianRupee}
        trend="+4 referrals this week"
      />
      <StatsCard 
        title="Lifetime Earnings" 
        value="₹24,000" 
        icon={IndianRupee}
        trend="12 total referrals"
      />
    </div>
  )
}
