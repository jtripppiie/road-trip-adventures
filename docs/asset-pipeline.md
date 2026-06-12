# Hide & Seek Asset Pipeline

The current Hide & Seek mode draws its rooms and objects with canvas code. If future versions add bitmap sprites, backgrounds, music or effects, keep assets organized by gameplay purpose and level theme.

## Suggested Structure

```text
assets/
  hide-seek/
    backgrounds/
      roadside-lodge/
      alaska-train/
      campground/
      rest-stop/
    sprites/
      players/
      costumes/
      npcs/
    objects/
      furniture/
      outdoor/
      obstacles/
      interactive/
    effects/
      reveal/
      dust/
      countdown/
    audio/
      ambience/
      footsteps/
      ui/
      music/
    ui/
      buttons/
      timers/
      scoreboards/
```

## Naming

Use descriptive lowercase filenames:

```text
alaska_train_object_luggage_stack_01.png
campground_tree_pine_large_01.png
rest_stop_ui_search_button_01.png
roadside_lodge_player_walk_down_01.png
```

Avoid vague names like `tree-final-v2.png`.

## Sprite Standards

Player sprites should share:

- transparent PNG backgrounds
- consistent pixel density
- the same anchor point
- the same collision-box standard
- matching animation states: idle, walk up/down/left/right, hide, search, found, celebrate

## Object Data

Objects should stay data-driven. A future bitmap object should still map to the same gameplay fields:

```js
{
  id: 'campground-tree-pine-large',
  label: 'pine tree',
  kind: 'tree',
  asset: 'campground_tree_pine_large_01',
  x: 590,
  y: 110,
  width: 110,
  height: 220,
  difficulty: 5,
  solid: true
}
```

The rule of thumb: adding a new level should mostly mean adding data and assets, not rewriting the movement, scoring or search systems.
