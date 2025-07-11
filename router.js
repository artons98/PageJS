window.PageJS = window.PageJS || {};

if (!PageJS.Router) {
  PageJS.Router = class {
    static async handleRouting({ autoResetUrl = true, delayBetweenSteps = 300, timeout = 5000 } = {}) {
      const configuredBase = PageJS.Config && PageJS.Config.settings ? PageJS.Config.settings.basePath : '';
      const basePath = configuredBase || PageJS.basePath || '';
      let pathSegments = window.location.pathname
        .split("/")
        .filter(p => p && p.trim());

      if (basePath) {
        const baseParts = basePath.split("/").filter(p => p && p.trim());
        const maybeBase = pathSegments.slice(0, baseParts.length).join("/");
        if (maybeBase === baseParts.join("/")) {
          pathSegments = pathSegments.slice(baseParts.length);
        }
      }

      if (pathSegments.length === 0) return;

      for (const segment of pathSegments) {
        try {
          const selector = `[data-route="${segment}"]`;
          const el = await PageJS.Utils.waitForElement(selector, timeout);
          el.click();
          await PageJS.Utils.sleep(delayBetweenSteps);
        } catch (err) {
          console.warn(`PageJS.Router: element voor segment "${segment}" niet gevonden.`, err);
          break;
        }
      }

      if (autoResetUrl) {
        window.history.replaceState({}, "", basePath || "/");
      }
    }
  };
}
