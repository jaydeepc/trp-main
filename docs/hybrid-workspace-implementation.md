# Hybrid Workspace Implementation Plan

## Phase 1: Core Architecture & Routing
- [ ] Create `frontend/src/pages/HybridWorkspace.tsx`
- [ ] Update `App.tsx` routing: `/` → HybridWorkspace, `/voice` → InteractionPage
- [ ] Remove current LandingPage from root route
- [ ] Test basic routing works

## Phase 2: Layout Structure
- [ ] Create flex layout in HybridWorkspace: 70/30 desktop split
- [ ] Add responsive breakpoints for mobile: 90/10 split
- [ ] Create mobile voice bar component (top or bottom placement)
- [ ] Test layout responsiveness across devices

## Phase 3: Dashboard Adaptation
- [ ] Clone Dashboard component → `DashboardCompact.tsx`
- [ ] Convert 4-column metrics grid → 2x2 grid
- [ ] Reduce supplier graph max-width from full to ~800px  
- [ ] Compress AI insights panel to 2-column layout
- [ ] Remove sticky header (conflicts with split layout)
- [ ] Optimize spacing for 70% viewport width
- [ ] Test dashboard in narrow container

## Phase 4: Voice Interface Adaptation
- [ ] Create `CompactVoiceInterface.tsx` from existing VoiceInterface
- [ ] Reduce audio visualization: 400px → 180px
- [ ] Convert horizontal controls → vertical stacked layout
- [ ] Add persistent "always connected" state indicator
- [ ] Create scrollable message history panel
- [ ] Optimize UI for 320px sidebar width
- [ ] Test voice functionality in compact mode

## Phase 5: Mobile Voice Bar (skip for now)
- [ ] Create `MobileVoiceBar.tsx` component
- [ ] Implement compact audio visualization (60px height)
- [ ] Add minimal controls (mute/unmute, connection status)
- [ ] Test bottom bar placement
- [ ] Test top bar placement  
- [ ] Choose optimal mobile placement
- [ ] Ensure no conflict with browser UI

## Phase 6: Integration & Testing
- [ ] Integrate DashboardCompact + CompactVoiceInterface in HybridWorkspace
- [ ] Add mobile voice bar for responsive breakpoints
- [ ] Test voice + dashboard interaction
- [ ] Test context-aware AI with dashboard data
- [ ] Verify pure voice mode still works at `/voice`
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile device testing (iOS Safari, Android Chrome)

## Phase 7: Polish & Optimization
- [ ] Add smooth transitions between layouts
- [ ] Optimize performance for dual-component rendering
- [ ] Add loading states for dashboard + voice initialization
- [ ] Test microphone permissions in hybrid mode
- [ ] Add keyboard shortcuts for voice controls
- [ ] Final UI/UX polish and animations
