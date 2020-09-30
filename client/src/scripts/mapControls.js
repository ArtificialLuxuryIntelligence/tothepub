import directionsArrow from './../assets/arrows/directions-arrow.svg';
import moonIcon from './../assets/icons/brightness_3-24px.svg';
import sunIcon from './../assets/icons/wb_sunny-24px.svg';
import teleportIcon from './../assets/icons/teleport.svg';
import { showTempModal } from './../scripts/mapboxMarker';

// custom mapbox-gl buttons
class ToggleDirectionsControl {
  constructor() {
    this.toggled = false;
    this.directions = document.getElementById('instructions');
  }

  toggleDisplayDirections(e) {
    this.directions.classList.toggle('instructions-active');
    this.toggled = !this.toggled;
  }

  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    let div = document.createElement('div');
    let button = document.createElement('button');
    let span = document.createElement('span');

    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    div.className = 'mapboxgl-ctrl';
    span.className = 'mapboxgl-ctrl-icon';
    span.id = 'directions';

    span.style.backgroundImage = `url(${directionsArrow})`;
    // "url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIxMDAiIGlkPSJzdmc2NTg0IiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSIxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6Y2M9Imh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL25zIyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzIGlkPSJkZWZzNjU4NiIvPjxnIGlkPSJsYXllcjEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsLTk1Mi4zNjIpIj48cGF0aCBkPSJtIDQ3LjkxNjY2NSw5NjIuNzc4NyBjIC00LjYwMjM3LDAgLTguMzMzMzMsMy43MzA4MyAtOC4zMzMzMyw4LjMzMzMzIDAsNC42MDI0OSAzLjczMDk2LDguMzMzMzIgOC4zMzMzMyw4LjMzMzMyIDQuNjAyMzgsMCA4LjMzMzMzLC0zLjczMDgzIDguMzMzMzMsLTguMzMzMzIgMCwtNC42MDI1IC0zLjczMDk1LC04LjMzMzMzIC04LjMzMzMzLC04LjMzMzMzIHogbSAtMjMuOTU4MzMzLDE2LjY2NjY1IDIuMDgzMzMzLDguMzMzMzMgYyAxLjA0MTY3LDQuMTY2NjYgMy41Mjk4Myw0LjE2NjY2IDYuNjQwNjMsNC4xNjY2NiBsIDYuOTAxMDQsMCBjIDIuNDczOTYsNC4xNjY2NyAxLjMxMTEyLDEwLjI5OTE2IDIuMDgzMzMsMTYuNjY2NjYgbCAtMy43NzYwNCwwIGMgLTQuMTY2NjcsMCAtMTAuODA3MjksNC4xNjY3IC02LjY0MDYzLDEyLjUgbCA2LjI1LDEyLjUgYyA0LjE2NjY3LDguMzMzMyAxMC40MTY2NywyLjA4MzMgOC4zMzMzNCwtMi4wODM0IGwgLTYuMjUsLTEyLjQ5OTkgYyAtMS4wNDE2NywtMi4wODM0IDEuMTAxMjUsLTIuMDgzNCAyLjA4MzMzLC0yLjA4MzQgbCAxMC4yODMwNCwwIGMgMCwwIDQuOTMyMjUsMTAuOTQ4MyAxMC43NDIwOSwxOC40NTIxIDIuMTQ0NjYsMi43NyA0LjUyMDI1LDYuNTQ3OSA3LjQ5Mzc1LDYuNTQ3OSAyLjA4MzMzLDAgNS42NTM0OSwtMy4yMTk2IDEuODUzNzksLTcuNzU0MiAtNy4xMTU1OSwtOC40OTE2IC0xMS42MjI2NywtMTcuMjQ1OCAtMTEuNjIyNjcsLTIxLjQxMjQgMCwtNC44NDY3IC0wLjg1MTQyLC0xNS4wNTI5NSAtMi4wODMzMywtMjAuODMzMzYgbCA2LjI1LDAgYyAyLjAzMzMzLDQuMDc1NDIgNS4yMDgzMywxMC40MTY2NiA1LjIwODMzLDEwLjQxNjY2IDIuMzAzMDgsMy45ODkyIDcuMjkxNjcsMy42ODc5IDcuMjkxNjcsMCAwLC0wLjUwNjIgMCwtMS42MjA0IC0wLjU4MTM0LC0yLjgyIGwgLTYuNzEwMzMsLTEzLjg0NjY1IGMgLTAuNDI4MjUsLTAuODgzNzUgLTEuMDU1OTIsLTIuMDgzMzMgLTQuMTY2NjcsLTIuMDgzMzMgbCAtMzIuMjkxNjYsMCAtMy4xMjUsLTEwLjQxNjY2IGMgLTEuMjUsLTQuMTY2NjcgLTcuMjkxNjcsLTQuMTY2NjcgLTcuMjkxNjcsMCAwLDIuMDgzMzMgMC43MzgxNjcsNC42MTI5MSAxLjA0MTY2Nyw2LjI0OTk5IHoiIGlkPSJwYXRoMTA1MjctMSIgc3R5bGU9ImNvbG9yOiMwMDAwMDA7ZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDoyO21hcmtlcjpub25lO3Zpc2liaWxpdHk6dmlzaWJsZTtkaXNwbGF5OmlubGluZTtvdmVyZmxvdzp2aXNpYmxlO2VuYWJsZS1iYWNrZ3JvdW5kOmFjY3VtdWxhdGUiLz48L2c+PC9zdmc+)";
    // span.style.backgroundSize = "contain";
    // span.style.backgroundOrigin = "padding-box";
    span.style.backgroundPosition = 'center';

    div.appendChild(button);
    button.appendChild(span);

    button.addEventListener('click', (e) => {
      this.toggleDisplayDirections();
    });
    this._container.appendChild(button);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

class ToggleDarkModeControl {
  constructor(toggleDarkMode, darkMode) {
    this.toggleDarkMode = toggleDarkMode;
    this.darkMode = darkMode;

    // this.toggled = true;
    // this.directions = document.getElementById("instructions");
  }

  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    // let div = document.createElement('div');
    let button = document.createElement('button');
    let span = document.createElement('span');

    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    // div.className = 'mapboxgl-ctrl';
    span.className = 'mapboxgl-ctrl-icon';
    span.id = 'dark-mode';

    // span.style.backgroundImage = this.darkMode
    //   ? `url(${sunIcon})`
    //   : `url(${moonIcon})`;

    //background image set in css (dark theme/class chages image)
    // span.style.backgroundSize = "contain";
    // span.style.backgroundOrigin = "padding-box";
    span.style.backgroundPosition = 'center';
    // div.appendChild(button);
    button.appendChild(span);

    button.addEventListener('click', (e) => {
      this.toggleDarkMode();
    });
    this._container.appendChild(button);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

class ToggleTeleportControl {
  constructor(toggleTeleport, teleport) {
    this.teleport = teleport;
    this.toggleTeleport = toggleTeleport;
    this.active = false;
  }

  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    let div = document.createElement('div');
    let button = document.createElement('button');
    let span = document.createElement('span');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    div.className = 'mapboxgl-ctrl';
    span.className = 'mapboxgl-ctrl-icon';
    span.id = 'teleport';
    button.id = 'teleport-button';
    span.style.backgroundImage = `url(${teleportIcon})`;
    span.style.backgroundPosition = 'center';
    div.appendChild(button);
    button.appendChild(span);
    // button.classList.add(this.teleport ? 'teleport-active' : null);

    button.addEventListener('click', () => {
      !this.active &&
        showTempModal('click anywhere on the map to teleport', 1000);
      this.active = !this.active;
      this.toggleTeleport();
    });
    this._container.appendChild(button);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

class NavigateHomeControl {
  constructor() {}

  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    let button = document.createElement('button');
    let span = document.createElement('span');

    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    span.className = 'mapboxgl-ctrl-icon';
    span.id = 'nav-home';

    span.style.backgroundPosition = 'center';
    button.appendChild(span);

    button.addEventListener('click', (e) => {
      location.reload();
    });
    this._container.appendChild(button);
    return this._container;
  }

  onRemove() {}
}

export {
  ToggleDarkModeControl,
  ToggleDirectionsControl,
  ToggleTeleportControl,
  NavigateHomeControl,
};
