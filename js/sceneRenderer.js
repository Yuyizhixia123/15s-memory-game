// Layered convenience-store scene rendering.

const SceneRenderer = {
  layers: {},
  root: null,

  init() {
    this.root = document.getElementById("convenienceScene");
    this.layers = {
      backgroundLayer: document.getElementById("backgroundLayer"),
      characterLayer: document.getElementById("characterLayer"),
      itemLayer: document.getElementById("itemLayer"),
      infoLayer: document.getElementById("infoLayer"),
      anomalyLayer: document.getElementById("anomalyLayer")
    };
  },

  render(state) {
    this.root.classList.toggle("scene-light-flash", state.lightFlashActive);
    this.clearLayers();
    this.renderBackground(state);
    this.renderItems(state.items);
    this.renderCharacters(state.customers);
    this.renderInfo(state);
    this.renderAnomalies(state);
  },

  clearLayers() {
    [
      this.layers.characterLayer,
      this.layers.itemLayer,
      this.layers.infoLayer,
      this.layers.anomalyLayer
    ].forEach((layer) => {
      layer.innerHTML = "";
    });
  },

  createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    element.className = className;

    if (text) {
      element.textContent = text;
    }

    return element;
  },

  renderBackground(state) {
    const existingDoor = this.layers.backgroundLayer.querySelector(".store-door");

    if (existingDoor) {
      existingDoor.classList.toggle("store-door-opening", state.doorAutoOpenActive);

      const fridge = this.layers.backgroundLayer.querySelector(".fridge");

      if (fridge) {
        fridge.classList.toggle("info-highlight", state.highlightedInfo === "fridge");
        fridge.dataset.count = state.fridgeCount;
      }

      return;
    }

    const wall = this.createElement("div", "scene-part store-wall");
    const floor = this.createElement("div", "scene-part store-floor");
    const floorMat = this.createElement("div", "scene-part entry-mat", "入口");
    const door = this.createElement("div", "scene-part store-door");
    const counter = this.createElement("div", "scene-part checkout-counter");
    const register = this.createElement("div", "register-machine");
    const scanner = this.createElement("div", "counter-scanner");
    const leftShelf = this.createShelf("scene-part store-shelf store-shelf-left");
    const midShelf = this.createShelf("scene-part store-shelf store-shelf-mid");
    const fridgeClass = state.highlightedInfo === "fridge"
      ? "scene-part fridge info-highlight"
      : "scene-part fridge";
    const fridge = this.createElement("div", fridgeClass);

    fridge.dataset.count = state.fridgeCount;
    door.classList.toggle("store-door-opening", state.doorAutoOpenActive);
    counter.append(register, scanner);

    this.layers.backgroundLayer.append(
      wall,
      floor,
      floorMat,
      door,
      counter,
      leftShelf,
      midShelf,
      fridge
    );
  },

  createShelf(className) {
    const shelf = this.createElement("div", className);

    for (let i = 0; i < 3; i += 1) {
      const board = this.createElement("div", "shelf-board");

      shelf.appendChild(board);
    }

    return shelf;
  },

  renderItems(items) {
    items.forEach((item) => {
      const removingItems = (sceneState.removingItems || [])
        .filter((removingItem) => removingItem.itemId === item.id);
      const classNames = [
        "scene-item",
        "product-group",
        `item-${item.type}`,
        item.area === "fridge" ? "fridge-product" : ""
      ].filter(Boolean);
      const itemElement = this.createElement("div", classNames.join(" "));
      const rackClassNames = [
        "product-rack",
        item.count <= 0 && removingItems.length === 0 ? "item-depleted" : ""
      ].filter(Boolean);
      const itemRack = this.createElement("div", rackClassNames.join(" "));
      const itemLabel = this.createElement("div", "product-label", item.name);
      const visibleCount = Math.max(0, item.count);
      const totalSlots = Math.max(item.initialCount || item.count, visibleCount + removingItems.length);

      for (let slotIndex = 0; slotIndex < totalSlots; slotIndex += 1) {
        if (slotIndex < visibleCount) {
          const product = this.createElement("span", `product-unit product-${item.type}`);

          itemRack.appendChild(product);
          continue;
        }

        const removingItem = removingItems[slotIndex - visibleCount];

        if (removingItem) {
          const effectClass = removingItem.effect === "taken"
            ? "product-taken-highlight"
            : "product-vanishing";
          const product = this.createElement(
            "span",
            `product-unit product-${removingItem.type} product-removing ${effectClass}`
          );

          product.dataset.removingId = removingItem.id;
          itemRack.appendChild(product);
          continue;
        }

        const placeholder = this.createElement("span", `product-unit product-${item.type} product-placeholder`);

        itemRack.appendChild(placeholder);
      }

      itemElement.dataset.itemId = item.id;
      itemElement.dataset.count = String(totalSlots);
      itemElement.title = item.name;
      itemElement.style.left = `${item.x}px`;
      if (item.area === "fridge" && typeof item.bottom === "number") {
        itemElement.style.bottom = `${item.bottom}px`;
      } else {
        itemElement.style.top = `${item.y}px`;
      }
      itemElement.style.setProperty("--item-flash-duration", `${sceneState.itemFlashDuration}s`);
      itemElement.append(itemRack, itemLabel);

      this.layers.itemLayer.appendChild(itemElement);
    });
  },

  renderCharacters(customers) {
    const customerArea = this.createElement("div", "scene-part customer-area", "门口通道");
    const cashier = this.createPersonElement("cashier", "店员", ["cashier-person"]);

    this.layers.characterLayer.append(customerArea, cashier);

    customers.forEach((customer) => {
      const classNames = [
        "customer-person",
        `customer-${customer.style}`,
        sceneState.lastCustomerId === customer.id ? "customer-entered" : ""
      ].filter(Boolean);
      const customerElement = this.createPersonElement("customer", customer.name, classNames);

      customerElement.dataset.customerId = customer.id;
      customerElement.style.left = `${customer.x}px`;
      customerElement.style.bottom = `${customer.y}px`;
      this.layers.characterLayer.appendChild(customerElement);
    });

    sceneState.departingCustomers.forEach((customer) => {
      const classNames = [
        "customer-person",
        "customer-exiting",
        `customer-${customer.style}`
      ];
      const customerElement = this.createPersonElement("customer", customer.name, classNames);

      customerElement.dataset.customerId = customer.id;
      customerElement.style.left = `${customer.x}px`;
      customerElement.style.bottom = `${customer.y}px`;
      this.layers.characterLayer.appendChild(customerElement);
    });
  },

  createPersonElement(role, label, classNames = []) {
    const person = this.createElement("div", ["scene-person", `${role}-figure`, ...classNames].join(" "));
    const head = this.createElement("span", "person-head");
    const body = this.createElement("span", "person-body");
    const legs = this.createElement("span", "person-legs");
    const tag = this.createElement("span", "person-label", label);

    person.append(head, body, legs, tag);
    return person;
  },

  renderInfo(state) {
    const clockClass = state.highlightedInfo === "clock"
      ? "scene-info wall-clock info-highlight"
      : "scene-info wall-clock";
    const amountClass = state.highlightedInfo === "cashier"
      ? "scene-info cashier-amount info-highlight"
      : "scene-info cashier-amount";
    const clock = this.createElement("div", clockClass, `时钟 ${state.clockTime}`);
    const amount = this.createElement("div", amountClass, `收银金额: ${state.cashierAmount}`);
    const monitor = this.createElement("div", "scene-info monitor-text", `监控 ${state.monitorState}`);
    const sign = this.createElement("div", "scene-info door-sign", "OPEN 24H");

    this.layers.infoLayer.append(clock, amount, monitor, sign);
  },

  renderAnomalies(state) {
    const lightClass = state.lightFlashActive
      ? "scene-anomaly light-placeholder light-active"
      : "scene-anomaly light-placeholder";
    const light = this.createElement("div", lightClass, `灯光${state.lightState}`);
    const shadowClass = [
      "scene-anomaly",
      "monitor-shadow",
      this.getShadowLocationClass(state.monitorShadowLocation),
      state.monitorShadowActive ? "monitor-shadow-active" : ""
    ].filter(Boolean).join(" ");
    const shadow = this.createElement("div", shadowClass);
    const noise = this.createElement("div", "scene-anomaly red-noise");

    this.layers.anomalyLayer.append(light, shadow, noise);
  },

  getShadowLocationClass(location) {
    const locationClasses = {
      "监控屏左侧": "monitor-shadow-left",
      "监控屏中央": "monitor-shadow-center",
      "监控屏右侧": "monitor-shadow-right",
      "监控屏下方": "monitor-shadow-bottom"
    };

    return locationClasses[location] || "monitor-shadow-center";
  }
};

