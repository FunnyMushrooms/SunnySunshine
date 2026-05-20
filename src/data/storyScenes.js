export const storyOrder = ['arrival','lifecycle','provider','kyc','fraud','bonus','payments','risk','finalHand','cvReveal']

export const scenes = {
  arrival: {
    insight: { title: 'Table Insight', text: 'A product conversation is about to hide inside a shell game.' },
    lines: [{ speaker: 'Dealer', text: 'You’re just in time.' }]
  },
  lifecycle: {
    insight: { title: 'Lifecycle Insight', text: 'Returning players are shaped by timing, previous experience, offer relevance, and friction.' },
    lines: [{ speaker: 'Dealer', text: 'How long has it been?' }, { speaker: 'Player', text: 'Three… four months, maybe.' }, { speaker: 'Dealer', text: 'Long enough to forget the odds. Not long enough to forget the feeling.' }]
  },
  provider: { insight: { title: 'Provider Insight', text: 'Provider quality affects session depth, discovery, trust, and content performance.' }, lines: [{ speaker: 'Dealer', text: 'Do you remember who introduced us?' }, { speaker: 'Player', text: 'I remember enough.' }, { speaker: 'Dealer', text: 'Some introductions are worth keeping. Some are traffic with a logo.' }] },
  kyc: { insight: { title: 'KYC Insight', text: 'Verification is a trust layer, but poor timing and friction can damage conversion.' }, lines: [{ speaker: 'Player', text: 'Do you even know who I am?' }, { speaker: 'Dealer', text: 'Enough to let you sit. Not enough to let you disappear.' }] },
  fraud: { insight: { title: 'Fraud Insight', text: 'Fraud patterns hide in transitions, exceptions, and trusted flows.' }, lines: [{ speaker: 'Dealer', text: 'Luck is a polite word for weak planning.' }] },
  bonus: { insight: { title: 'Bonus Insight', text: 'Bonus design balances excitement, cost, abuse risk, and long-term value.' }, lines: [{ speaker: 'Dealer', text: 'You can keep what you chose. Or make it interesting.' }] },
  payments: { insight: { title: 'Payments Insight', text: 'States matter: pending, approved, declined, reversed, refunded, manual review.' }, lines: [{ speaker: 'Player', text: 'You pay immediately?' }, { speaker: 'Dealer', text: 'Only when the system knows what it owes.' }] },
  risk: { insight: { title: 'Risk & Compliance', text: 'Good logic leaves evidence: decisions, states, actions, ownership, audit trails.' }, lines: [{ speaker: 'Dealer', text: 'Rules are boring until someone asks for proof.' }] },
  finalHand: { insight: { title: 'Final Insight', text: 'The game ends. Product judgment does not.' }, lines: [{ speaker: 'Dealer', text: 'One last hand. For judgment.' }] },
  cvReveal: { insight: { title: 'Confidential', text: 'Candidate profile unlocked.' }, lines: [{ speaker: 'Dealer', text: 'Take a look. Tell me if this man fits the job.' }] }
}
