
avoid 
 * useEffects being overused  
 * prop drilling
 * too many prop passing to smaller components
 * side effects

 when creating a component, determine if logic could be reusable elsewhere.
 If so, turn it into a utility function and place in an existing /lib/utils/ folder.

huge client components doing too many things such as
  * fetching data
  * managing state
  * rendering
  * handling modals

  Do instead
   * Container vs presentation
   * Split logic into hooks
   * Keep components small and isolated to one or 2 pieces of logic

Client components are for:

    interactivity
    local UI state
    animations
    forms
    event handling

They are NOT for:
    fetching core data
    security
    orchestration
    business rules