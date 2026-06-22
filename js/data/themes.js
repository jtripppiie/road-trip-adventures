/* Shared theme metadata.

   Single source of truth for cross-cutting theme labels that are reused by
   multiple data modules (scavenger alphabet themes, Hide & Seek maps, etc.).
   Must load before any module that references window.RTA_THEMES.
*/
(function () {
  window.RTA_THEMES = {
    'alaska-train': {
      id: 'alaska-train',
      label: 'Alaska Train',
    },
  };
})();
