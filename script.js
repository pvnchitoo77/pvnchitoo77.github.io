// Datos editables: reemplaza el ID final de cada URL embed por videos reales del canal.
const videos = [
  {
    title: "Spinning Desde Orilla 🐟 - Zona Centro Sur De Chile",
    type: "Salida de pesca",
    embed: "https://youtu.be/kKdqMdpAaI0?si=gRtGf-yz_aEDHqZP"
  },
  {
    title: "Spinning ligero: señuelos simples para comenzar",
    type: "TikTok",
    embed: "https://www.tiktok.com/@altafishing/video/7344431672948985093?is_from_webapp=1&sender_device=pc&web_id=7613524437803140615"
  },
  {
    title: "Probando spinning pesado con viento y oleaje",
    type: "TikTok",
    embed: "https://www.tiktok.com/@altafishing/video/7611315222766292232?is_from_webapp=1&sender_device=pc&web_id=7613524437803140615"
  }
];

// Catalogo visual: por ahora son productos de referencia para la comunidad.
const products = [
  {
    id: "cana-spinning-ligero",
    name: "Caña de spinning ligero",
    category: "canas",
    tag: "Ligero",
    use: "Playas, rios y señuelos medianos",
    detail: "Equipo equilibrado para jornadas largas, facil de transportar y pensado para sentir mejor las picadas con señuelos livianos.",
    specs: ["Largo sugerido: 2,10 a 2,40 m", "Accion: rapida", "Peso de señuelo: 7 a 28 g"],
    image: "https://images.unsplash.com/photo-1501959915551-4e8d30928317?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "cana-spinning-pesado",
    name: "Caña de spinning pesado",
    category: "canas",
    tag: "Pesado",
    use: "Orilla con viento, oleaje o lance largo",
    detail: "Pensada para pescar playas abiertas, rocas y sectores donde necesitas mayor distancia de lanzamiento y control.",
    specs: ["Largo sugerido: 2,70 a 3,00 m", "Accion: media rapida", "Peso de señuelo: 30 a 80 g"],
    image: "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "carrete-3000",
    name: "Carrete tamaño 3000",
    category: "carretes",
    tag: "Versatil",
    use: "Buena opcion para spinning costero",
    detail: "Carrete liviano para combinar con cañas medianas, ideal para comenzar o armar un equipo de uso frecuente.",
    specs: ["Relacion aprox.: 5.2:1", "Freno delantero", "Capacidad: multifilamento 0,18 mm"],
    image: "https://images.unsplash.com/photo-1529230117010-b6c436154f25?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "carrete-5000",
    name: "Carrete tamaño 5000",
    category: "carretes",
    tag: "Lance",
    use: "Para señuelos pesados y lineas mas firmes",
    detail: "Opcion de mayor tamaño para trabajar señuelos pesados, pelear peces fuertes y pescar con viento.",
    specs: ["Relacion aprox.: 5.1:1", "Freno reforzado", "Capacidad: multifilamento 0,25 mm"],
    image: "https://images.unsplash.com/photo-1516575334481-f85287c2c82d?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "senuelo-minnow",
    name: "Señuelos minnow",
    category: "senuelos",
    tag: "Minnow",
    use: "Para buscar actividad en orilla y desembocaduras",
    detail: "Señuelos con nado marcado para cubrir agua rapido, explorar corrientes y tentar ataques cerca de la orilla.",
    specs: ["Largo: 9 a 12 cm", "Profundidad: baja a media", "Uso: recogida lineal y tirones cortos"],
    image: "https://images.unsplash.com/photo-1762110740691-6ecda4f51642?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "senuelo-metalico",
    name: "Jigs y cucharas metalicas",
    category: "senuelos",
    tag: "Metal",
    use: "Buenos para lance largo y agua movida",
    detail: "Señuelos metalicos compactos para alcanzar distancia, trabajar capas profundas y pescar cuando hay viento.",
    specs: ["Peso: 20 a 60 g", "Terminacion: brillo metalico", "Uso: jigging ligero y recogida rapida"],
    image: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=900&q=80"
  }
];

const productCommerce = {
  "cana-spinning-ligero": { price: 39990, stock: 8 },
  "cana-spinning-pesado": { price: 52990, stock: 5 },
  "carrete-3000": { price: 45990, stock: 12 },
  "carrete-5000": { price: 64990, stock: 6 },
  "senuelo-minnow": { price: 8990, stock: 20 },
  "senuelo-metalico": { price: 6990, stock: 28 }
};

products.forEach((product) => Object.assign(product, productCommerce[product.id] ?? { price: 0, stock: 0 }));

const state = {
  filter: "all",
  query: "",
  tideDays: 1,
  tideData: null,
  cart: []
};

const storeEmail = "contactoaltafishing@gmail.com";

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const cardinalDirections = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function windDirectionLabel(degrees = 0) {
  const index = Math.round(degrees / 45) % 8;
  return cardinalDirections[index];
}

function nearestHourlyValue(hourly, key) {
  if (!hourly?.time?.length || !hourly[key]?.length) return null;
  const now = Date.now();
  let bestIndex = 0;
  let bestDistance = Infinity;

  hourly.time.forEach((time, index) => {
    const distance = Math.abs(new Date(time).getTime() - now);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return hourly[key][bestIndex] ?? null;
}

function money(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(value);
}

function mailtoUrl(subject, body) {
  return `mailto:${storeEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function productEmailUrl(product, quantity = 1) {
  const amount = clamp(Number(quantity) || 1, 1, product.stock);
  const total = product.price * amount;
  const message = [
    "Hola AltaFishing, quiero comprar este producto:",
    "",
    `Producto: ${product.name}`,
    `Cantidad: ${amount}`,
    `Total estimado: ${money(total)}`,
    "",
    "Quedo atento/a para coordinar pago y entrega."
  ].join("\n");
  return mailtoUrl(`Pedido AltaFishing: ${product.name}`, message);
}

function calculateClarity(weather, visibilityMeters) {
  const cloud = weather.cloud_cover ?? 45;
  const rain = weather.precipitation ?? 0;
  const visibilityScore = visibilityMeters ? clamp((visibilityMeters / 12000) * 100, 25, 100) : 72;
  const rainPenalty = clamp(rain * 18, 0, 35);
  const cloudPenalty = clamp(cloud * 0.18, 0, 18);
  return Math.round(clamp(visibilityScore - rainPenalty - cloudPenalty, 18, 98));
}

function calculateBiteIndex({ wind, clarity, rain, waveHeight, tideTrend }) {
  const windScore = 100 - clamp(Math.abs(wind - 18) * 3.1, 0, 52);
  const clarityScore = clarity;
  const waveScore = waveHeight == null ? 68 : 100 - clamp(Math.abs(waveHeight - 1.1) * 32, 0, 48);
  const rainScore = 100 - clamp(rain * 28, 0, 42);
  const tideScore = tideTrend === "Subiendo" ? 88 : tideTrend === "Bajando" ? 76 : 66;

  return Math.round(clamp(
    windScore * 0.28 + clarityScore * 0.28 + waveScore * 0.18 + rainScore * 0.12 + tideScore * 0.14,
    20,
    96
  ));
}

function tideTrendFromMarine(hourly) {
  if (!hourly?.time?.length || !hourly.sea_level_height_msl?.length) {
    return { label: "Sin dato", waveHeight: null };
  }

  const now = Date.now();
  let index = 0;
  let bestDistance = Infinity;
  hourly.time.forEach((time, itemIndex) => {
    const distance = Math.abs(new Date(time).getTime() - now);
    if (distance < bestDistance) {
      bestDistance = distance;
      index = itemIndex;
    }
  });

  const current = hourly.sea_level_height_msl[index];
  const next = hourly.sea_level_height_msl[Math.min(index + 1, hourly.sea_level_height_msl.length - 1)];
  const previous = hourly.sea_level_height_msl[Math.max(index - 1, 0)];
  const compare = next ?? previous ?? current;
  const waveHeight = hourly.wave_height?.[index] ?? null;

  if (current == null || compare == null) return { label: "Sin dato", waveHeight };
  if (Math.abs(compare - current) < 0.015) return { label: "Estable", waveHeight };
  return { label: compare > current ? "Subiendo" : "Bajando", waveHeight };
}

async function fetchFishingConditions(latitude, longitude) {
  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherUrl.search = new URLSearchParams({
    latitude,
    longitude,
    current: "wind_speed_10m,wind_direction_10m,precipitation,cloud_cover,weather_code",
    hourly: "visibility",
    wind_speed_unit: "kmh",
    timezone: "auto",
    forecast_days: "1"
  });

  const marineUrl = new URL("https://marine-api.open-meteo.com/v1/marine");
  marineUrl.search = new URLSearchParams({
    latitude,
    longitude,
    hourly: "sea_level_height_msl,wave_height",
    timezone: "auto",
    forecast_days: "1"
  });

  const weatherResponse = await fetch(weatherUrl);
  if (!weatherResponse.ok) throw new Error("No se pudo obtener el clima actual.");
  const weather = await weatherResponse.json();

  let marine = null;
  try {
    const marineResponse = await fetch(marineUrl);
    if (marineResponse.ok) marine = await marineResponse.json();
  } catch {
    marine = null;
  }

  const current = weather.current ?? {};
  const visibility = nearestHourlyValue(weather.hourly, "visibility");
  const clarity = calculateClarity(current, visibility);
  const marineTrend = tideTrendFromMarine(marine?.hourly);
  const biteIndex = calculateBiteIndex({
    wind: current.wind_speed_10m ?? 0,
    clarity,
    rain: current.precipitation ?? 0,
    waveHeight: marineTrend.waveHeight,
    tideTrend: marineTrend.label
  });

  return {
    wind: Math.round(current.wind_speed_10m ?? 0),
    direction: windDirectionLabel(current.wind_direction_10m ?? 0),
    clarity,
    tide: marineTrend.label,
    biteIndex,
    usedMarineData: Boolean(marine?.hourly?.sea_level_height_msl?.length)
  };
}

function updateFishingPanel(data) {
  qs("[data-marea]").textContent = data.tide;
  qs("[data-viento]").textContent = `${data.wind} km/h ${data.direction}`;
  qs("[data-claridad]").textContent = `${data.clarity}%`;
  qs("[data-pique]").textContent = data.biteIndex;
  qs("[data-bite-bar]").style.setProperty("--score", `${data.biteIndex}%`);
}

function setupFishingConditions() {
  const button = qs("[data-use-location]");
  const status = qs("[data-fishing-status]");
  if (!button || !status) return;

  const updateFromLocation = () => {
    if (!navigator.geolocation) {
      status.textContent = "Tu navegador no permite geolocalizacion.";
      return;
    }

    button.disabled = true;
    status.textContent = "Pidiendo ubicacion y consultando condiciones reales...";

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const data = await fetchFishingConditions(latitude.toFixed(4), longitude.toFixed(4));
        updateFishingPanel(data);
        status.textContent = data.usedMarineData
          ? "Datos actualizados con Open-Meteo Weather y Marine segun tu ubicacion."
          : "Viento actualizado con Open-Meteo. Marea marina no disponible para esta ubicacion.";
      } catch (error) {
        status.textContent = "No se pudieron actualizar las condiciones. Intentalo nuevamente.";
      } finally {
        button.disabled = false;
      }
    }, () => {
      status.textContent = "Permiso de ubicacion rechazado. Se mantienen datos de referencia.";
      button.disabled = false;
    }, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 15 * 60 * 1000
    });
  };

  button.addEventListener("click", updateFromLocation);
  window.setTimeout(updateFromLocation, 600);
}

function formatHour(value) {
  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short"
  }).format(new Date(value));
}

function formatDayName(value) {
  return new Intl.DateTimeFormat("es-CL", {
    weekday: "short",
    day: "2-digit"
  }).format(new Date(value));
}

function sameLocalDay(a, b = new Date()) {
  const first = new Date(a);
  const second = new Date(b);
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();
}

function daysFromNow(value) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const target = new Date(value);
  target.setHours(0, 0, 0, 0);
  return Math.floor((target.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
}

function eventsForDayRange(events, days = 1) {
  const maxDays = clamp(Number(days) || 1, 1, 7);
  return events.filter((event) => {
    const delta = daysFromNow(event.time);
    return delta >= 0 && delta < maxDays;
  });
}

function nearestEvent(events, type) {
  const now = Date.now();
  return events
    .filter((event) => event.type === type)
    .sort((a, b) => Math.abs(new Date(a.time).getTime() - now) - Math.abs(new Date(b.time).getTime() - now))[0] ?? null;
}

function nearestForecastValue(hourly, key, targetDate) {
  if (!hourly?.time?.length || !hourly[key]?.length) return null;
  const target = new Date(targetDate).getTime();
  let index = 0;
  let bestDistance = Infinity;
  hourly.time.forEach((time, itemIndex) => {
    const value = hourly[key]?.[itemIndex];
    if (value == null) return;
    const distance = Math.abs(new Date(time).getTime() - target);
    if (distance < bestDistance) {
      bestDistance = distance;
      index = itemIndex;
    }
  });
  return {
    time: hourly.time[index],
    value: hourly[key][index],
    direction: hourly.wind_direction_10m?.[index] ?? null
  };
}

function clockAngleFromDate(value) {
  const date = new Date(value);
  const dayProgress = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  if (dayProgress <= 18) return (dayProgress / 18) * 180;
  return 180 + ((dayProgress - 18) / 6) * 180;
}

function offsetCoordinate(latitude, longitude, distanceKm, bearingDegrees) {
  const earthRadiusKm = 6371;
  const angularDistance = distanceKm / earthRadiusKm;
  const bearing = bearingDegrees * Math.PI / 180;
  const lat1 = latitude * Math.PI / 180;
  const lon1 = longitude * Math.PI / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance)
      + Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
  );
  const lon2 = lon1 + Math.atan2(
    Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
    Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
  );

  return {
    latitude: lat2 * 180 / Math.PI,
    longitude: ((lon2 * 180 / Math.PI + 540) % 360) - 180
  };
}

const fallbackCoastalPoint = {
  latitude: -33.03,
  longitude: -71.63,
  label: "Valparaiso, Chile"
};

function moonPhaseName(date = new Date()) {
  return moonPhaseInfo(date).name;
}

function moonPhaseInfo(date = new Date()) {
  const knownNewMoon = new Date("2000-01-06T18:14:00Z").getTime();
  const synodicMonth = 29.53058867 * 24 * 60 * 60 * 1000;
  const age = ((date.getTime() - knownNewMoon) % synodicMonth + synodicMonth) % synodicMonth;
  const phase = age / synodicMonth;

  if (phase < 0.03 || phase > 0.97) return { name: "Luna nueva", className: "moon-new" };
  if (phase < 0.22) return { name: "Creciente", className: "moon-waxing" };
  if (phase < 0.28) return { name: "Cuarto creciente", className: "moon-quarter-first" };
  if (phase < 0.47) return { name: "Gibosa creciente", className: "moon-waxing" };
  if (phase < 0.53) return { name: "Luna llena", className: "moon-full" };
  if (phase < 0.72) return { name: "Gibosa menguante", className: "moon-waning" };
  if (phase < 0.78) return { name: "Cuarto menguante", className: "moon-quarter-last" };
  return { name: "Menguante", className: "moon-waning" };
}

function tideEventsFromHourly(hourly) {
  if (!hourly?.time?.length || !hourly.sea_level_height_msl?.length) return [];

  const times = hourly.time;
  const heights = hourly.sea_level_height_msl;
  const waves = hourly.wave_height ?? [];
  const events = [];

  for (let index = 1; index < heights.length - 1; index += 1) {
    const previous = heights[index - 1];
    const current = heights[index];
    const next = heights[index + 1];
    if ([previous, current, next].some((value) => value == null)) continue;

    if (current >= previous && current > next) {
      events.push({ type: "Pleamar", time: times[index], height: current, wave: waves[index] ?? null });
    }
    if (current <= previous && current < next) {
      events.push({ type: "Bajamar", time: times[index], height: current, wave: waves[index] ?? null });
    }
  }

  return events;
}

function tideStateFromHourly(hourly, events) {
  const times = hourly.time ?? [];
  const heights = hourly.sea_level_height_msl ?? [];
  const waves = hourly.wave_height ?? [];
  const now = Date.now();
  let index = 0;
  let bestDistance = Infinity;

  times.forEach((time, itemIndex) => {
    const distance = Math.abs(new Date(time).getTime() - now);
    if (distance < bestDistance) {
      bestDistance = distance;
      index = itemIndex;
    }
  });

  const current = heights[index] ?? null;
  const nextHeight = heights[Math.min(index + 1, heights.length - 1)] ?? current;
  const trend = nextHeight > current ? "Subiendo" : nextHeight < current ? "Bajando" : "Estable";
  const nextEvents = events.filter((event) => new Date(event.time).getTime() >= now);
  const previousEvents = events.filter((event) => new Date(event.time).getTime() <= now);
  const nextEvent = nextEvents[0] ?? null;
  const previousEvent = previousEvents[previousEvents.length - 1] ?? null;
  const closeEvent = events.find((event) => Math.abs(new Date(event.time).getTime() - now) < 45 * 60 * 1000);
  const label = closeEvent?.type ?? trend;

  const angle = clockAngleFromDate(now);

  return {
    label,
    height: current,
    wave: waves[index] ?? null,
    angle,
    nextHigh: nextEvents.find((event) => event.type === "Pleamar") ?? null,
    nextLow: nextEvents.find((event) => event.type === "Bajamar") ?? null
  };
}

async function fetchTideDashboard(latitude, longitude) {
  const buildMarineUrl = (lat, lon) => {
    const marineUrl = new URL("https://marine-api.open-meteo.com/v1/marine");
    marineUrl.search = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lon.toFixed(4),
      hourly: "sea_level_height_msl,wave_height,wave_period",
      timezone: "auto",
      cell_selection: "sea",
      past_days: "1",
      forecast_days: "7"
    });
    return marineUrl;
  };

  const hasSeaLevelData = (marine) => Boolean(
    marine?.hourly?.sea_level_height_msl?.some((value) => value != null)
  );

  const fetchMarineAt = async (lat, lon, distanceKm = 0) => {
    const marineResponse = await fetch(buildMarineUrl(lat, lon));
    if (!marineResponse.ok) return null;
    const marine = await marineResponse.json();
    if (!hasSeaLevelData(marine)) return null;
    return {
      marine,
      marinePoint: {
        latitude: lat,
        longitude: lon,
        distanceKm
      }
    };
  };

  const fetchNearestMarine = async () => {
    const direct = await fetchMarineAt(Number(latitude), Number(longitude), 0);
    if (direct) return direct;

    const distances = [25, 50, 100, 200, 400, 800];
    const bearings = [270, 225, 315, 180, 0, 135, 45, 90];
    for (const distance of distances) {
      const attempts = bearings.map((bearing) => {
        const point = offsetCoordinate(Number(latitude), Number(longitude), distance, bearing);
        return fetchMarineAt(point.latitude, point.longitude, distance);
      });
      const results = (await Promise.allSettled(attempts))
        .filter((result) => result.status === "fulfilled" && result.value)
        .map((result) => result.value);
      if (results.length) return results.sort((a, b) => a.marinePoint.distanceKm - b.marinePoint.distanceKm)[0];
    }

    const fallback = await fetchMarineAt(fallbackCoastalPoint.latitude, fallbackCoastalPoint.longitude, null);
    return fallback ? {
      ...fallback,
      marinePoint: {
        ...fallback.marinePoint,
        fallback: true,
        label: fallbackCoastalPoint.label
      }
    } : null;
  };

  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherUrl.search = new URLSearchParams({
    latitude,
    longitude,
    current: "wind_speed_10m,wind_direction_10m",
    hourly: "wind_speed_10m,wind_direction_10m",
    daily: "sunrise,sunset",
    wind_speed_unit: "kmh",
    timezone: "auto",
    forecast_days: "4"
  });

  const [marineResult, weatherResponse] = await Promise.all([
    fetchNearestMarine(),
    fetch(weatherUrl)
  ]);

  if (!marineResult) throw new Error("No se pudo obtener informacion marina cercana.");
  const { marine, marinePoint } = marineResult;
  const weather = weatherResponse.ok ? await weatherResponse.json() : null;

  if (!marine.hourly?.sea_level_height_msl?.length) {
    throw new Error("No hay serie de marea para esta ubicacion.");
  }

  const events = tideEventsFromHourly(marine.hourly);
  const stateNow = tideStateFromHourly(marine.hourly, events);
  const todayEvents = events.filter((event) => sameLocalDay(event.time));
  const threeDaysAhead = new Date();
  threeDaysAhead.setDate(threeDaysAhead.getDate() + 3);
  threeDaysAhead.setHours(new Date().getHours(), 0, 0, 0);

  return {
    hourly: marine.hourly,
    events,
    todayEvents,
    stateNow,
    userPoint: {
      latitude: Number(latitude),
      longitude: Number(longitude)
    },
    wind: {
      now: {
        speed: weather?.current?.wind_speed_10m ?? null,
        direction: weather?.current?.wind_direction_10m ?? null,
        time: weather?.current?.time ?? null
      },
      threeDays: nearestForecastValue(weather?.hourly, "wind_speed_10m", threeDaysAhead)
    },
    sunrise: weather?.daily?.sunrise?.[0] ?? null,
    sunset: weather?.daily?.sunset?.[0] ?? null,
    timezone: marine.timezone ?? "auto",
    marinePoint
  };
}

function drawFishIcon(ctx, x, y, scale = 1, color = "rgba(21,93,156,0.55)") {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(-18, -7);
  ctx.lineTo(-18, 7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.beginPath();
  ctx.arc(6, -2, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSunIcon(ctx, x, y, isSunset = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#f2b52b";
  ctx.fillStyle = "#f2b52b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 8, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(14, 0);
  ctx.stroke();
  for (let ray = -2; ray <= 2; ray += 1) {
    const angle = -Math.PI / 2 + ray * 0.36;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 13, Math.sin(angle) * 13);
    ctx.lineTo(Math.cos(angle) * 18, Math.sin(angle) * 18);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, isSunset ? -24 : -17);
  ctx.lineTo(isSunset ? -6 : 6, isSunset ? -18 : -23);
  ctx.lineTo(isSunset ? 6 : -6, isSunset ? -18 : -23);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawTideChart(hourly, events = [], sunrise = null, sunset = null, days = 1) {
  const canvas = qs("#tideChart");
  if (!canvas || !hourly?.time?.length) return;
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * devicePixelRatio;
  canvas.height = 380 * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

  const width = rect.width;
  const height = 380;
  const padding = { left: 58, right: 30, top: 42, bottom: 64 };
  const selectedDays = clamp(Number(days) || 1, 1, 7);
  const dayIndexes = hourly.time
    .map((time, index) => ({ time, index }))
    .filter((item) => {
      const delta = daysFromNow(item.time);
      return delta >= 0 && delta < selectedDays;
    });
  const chartIndexes = dayIndexes.length >= 2
    ? dayIndexes.map((item) => item.index)
    : hourly.time.slice(0, 25).map((_, index) => index);
  const times = chartIndexes.map((index) => hourly.time[index]);
  const heights = chartIndexes.map((index) => hourly.sea_level_height_msl?.[index] ?? null);
  const startTime = new Date(times[0]).getTime();
  const endTime = new Date(times[times.length - 1]).getTime();
  const heightValues = heights.filter((value) => value != null);
  if (!heightValues.length) return;
  const minTide = Math.min(...heightValues) - 0.18;
  const maxTide = Math.max(...heightValues) + 0.18;
  const tideRange = Math.max(maxTide - minTide, 0.4);
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const xForIndex = (index) => padding.left + (index / Math.max(times.length - 1, 1)) * plotWidth;
  const xForTime = (time) => {
    const value = new Date(time).getTime();
    return padding.left + clamp((value - startTime) / Math.max(endTime - startTime, 1), 0, 1) * plotWidth;
  };
  const yForTide = (value) => padding.top + (1 - ((value - minTide) / tideRange)) * plotHeight;
  const nearestHeightForTime = (time) => {
    const target = new Date(time).getTime();
    let index = 0;
    let bestDistance = Infinity;
    times.forEach((itemTime, itemIndex) => {
      const distance = Math.abs(new Date(itemTime).getTime() - target);
      if (distance < bestDistance) {
        bestDistance = distance;
        index = itemIndex;
      }
    });
    return heights[index] ?? 0;
  };

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#eef7fc";
  ctx.fillRect(0, 0, width, height);

  const sky = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
  sky.addColorStop(0, "rgba(255,255,255,0.82)");
  sky.addColorStop(1, "rgba(217,238,251,0.2)");
  ctx.fillStyle = sky;
  ctx.fillRect(padding.left, padding.top, plotWidth, plotHeight);

  const activityEvents = events.filter((event) => {
    const time = new Date(event.time).getTime();
    return time >= startTime && time <= endTime;
  });

  const dayStart = sunrise ? new Date(sunrise).getTime() : null;
  const dayEnd = sunset ? new Date(sunset).getTime() : null;
  if (dayStart && dayEnd) {
    const x1 = xForTime(dayStart);
    const x2 = xForTime(dayEnd);
    ctx.fillStyle = "rgba(55,183,255,0.13)";
    ctx.fillRect(Math.max(padding.left, x1), padding.top, clamp(x2 - x1, 0, plotWidth), plotHeight);
    if (dayStart >= startTime && dayStart <= endTime) {
      drawSunIcon(ctx, x1, padding.top - 8, false);
      ctx.fillStyle = "#f2b52b";
      ctx.font = "bold 12px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(formatHour(sunrise), x1, padding.top - 24);
    }
    if (dayEnd >= startTime && dayEnd <= endTime) {
      drawSunIcon(ctx, x2, padding.top - 8, true);
      ctx.fillStyle = "#f2b52b";
      ctx.font = "bold 12px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(formatHour(sunset), x2, padding.top - 24);
    }
  }

  activityEvents.forEach((event) => {
    const eventTime = new Date(event.time).getTime();
    const start = Math.max(startTime, eventTime - 90 * 60 * 1000);
    const end = Math.min(endTime, eventTime + 90 * 60 * 1000);
    const x = padding.left + ((start - startTime) / (endTime - startTime)) * plotWidth;
    const zoneWidth = ((end - start) / (endTime - startTime)) * plotWidth;
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, event.type === "Pleamar" ? "rgba(55,183,255,0.16)" : "rgba(216,64,64,0.11)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(x, padding.top, zoneWidth, plotHeight);
  });

  ctx.strokeStyle = "rgba(21,93,156,0.12)";
  ctx.lineWidth = 1;
  for (let line = 0; line < 4; line += 1) {
    const y = padding.top + line * (plotHeight / 3);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(7,19,31,0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.lineTo(width - padding.right, height - padding.bottom);
  ctx.stroke();

  ctx.fillStyle = "#07131f";
  ctx.font = "12px system-ui";
  ctx.textAlign = "left";
  ctx.fillText("altura (m)", 8, padding.top + 5);

  const yLabels = [minTide, (minTide + maxTide) / 2, maxTide];
  yLabels.forEach((value) => {
    const y = yForTide(value);
    ctx.fillStyle = "#617485";
    ctx.fillText(value.toFixed(1), 18, y + 4);
  });

  ctx.beginPath();
  heights.forEach((value, index) => {
    if (value == null) return;
    const x = xForIndex(index);
    const y = yForTide(value);
    if (index === 0) ctx.moveTo(x, y);
    else {
      const previousX = xForIndex(index - 1);
      const previousY = yForTide(heights[index - 1] ?? value);
      const midX = (previousX + x) / 2;
      ctx.bezierCurveTo(midX, previousY, midX, y, x, y);
    }
  });
  ctx.strokeStyle = "#37b7ff";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.lineTo(width - padding.right, height - padding.bottom);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.closePath();
  const fill = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
  fill.addColorStop(0, "rgba(55,183,255,0.28)");
  fill.addColorStop(1, "rgba(21,93,156,0.08)");
  ctx.fillStyle = fill;
  ctx.fill();

  activityEvents.forEach((event) => {
    const x = xForTime(event.time);
    const eventHeight = event.height ?? nearestHeightForTime(event.time);
    const y = yForTide(eventHeight);
    const isHigh = event.type === "Pleamar";
    ctx.fillStyle = isHigh ? "#2e9ed2" : "#d84040";
    ctx.strokeStyle = "#eef7fc";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isHigh ? "#2e9ed2" : "#d84040";
    ctx.font = "bold 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(formatHour(event.time), x, y + (isHigh ? -16 : 26));
  });

  activityEvents.forEach((event, eventIndex) => {
    const eventTime = new Date(event.time).getTime();
    const start = Math.max(startTime, eventTime - 2 * 60 * 60 * 1000);
    const end = Math.min(endTime, eventTime + 2 * 60 * 60 * 1000);
    const fishCount = event.type === "Pleamar" ? 5 : 4;
    for (let fishIndex = 0; fishIndex < fishCount; fishIndex += 1) {
      const ratio = fishCount === 1 ? 0.5 : fishIndex / (fishCount - 1);
      const x = padding.left + ((start + (end - start) * ratio - startTime) / (endTime - startTime)) * plotWidth;
      const y = height - padding.bottom - 24 - ((fishIndex + eventIndex) % 3) * 14;
      drawFishIcon(ctx, x, y, 0.72, event.type === "Pleamar" ? "rgba(46,158,210,0.62)" : "rgba(216,64,64,0.5)");
    }
  });

  ctx.fillStyle = "#617485";
  ctx.font = "12px system-ui";
  ctx.textAlign = "center";
  const labelStep = selectedDays === 1 ? 4 : selectedDays <= 3 ? 8 : 24;
  times.forEach((time, index) => {
    if (index % labelStep !== 0 && index !== times.length - 1) return;
    const label = selectedDays === 1 ? formatHour(time) : formatDayName(time);
    ctx.fillText(label, xForIndex(index), height - 20);
  });

  const now = Date.now();
  if (now >= startTime && now <= endTime) {
    const x = xForTime(now);
    ctx.strokeStyle = "rgba(155, 237, 90, 0.9)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, padding.top);
    ctx.lineTo(x, height - padding.bottom);
    ctx.stroke();
  }
}

function renderTideRange(data) {
  const days = clamp(Number(state.tideDays) || 1, 1, 7);
  const table = qs("[data-tide-table]");
  const daysLabel = qs("[data-tide-days-label]");
  if (daysLabel) daysLabel.textContent = days === 1 ? "1 dia" : `${days} dias`;
  if (!table || !data) return;

  const rangeEvents = eventsForDayRange(data.events, days).slice(0, 24);
  table.innerHTML = rangeEvents.length ? rangeEvents.map((event) => `
    <tr>
      <td>${days === 1 ? formatHour(event.time) : `${formatDayName(event.time)} ${formatHour(event.time)}`}</td>
      <td><strong>${event.type}</strong></td>
      <td>${event.height == null ? "--" : `${event.height.toFixed(2)} m`}</td>
      <td>${event.type === "Pleamar" ? "Alta" : "Cambio"}</td>
    </tr>
  `).join("") : `<tr><td colspan="4">No se detectaron extremos claros para este rango.</td></tr>`;

  drawTideChart(data.hourly, data.events, data.sunrise, data.sunset, days);
}

function renderTideDashboard(data) {
  const { events, stateNow, sunrise, sunset, marinePoint, wind } = data;
  const source = qs("[data-tide-source]");
  const highForDisplay = stateNow.nextHigh ?? nearestEvent(events, "Pleamar") ?? null;
  const lowForDisplay = stateNow.nextLow ?? nearestEvent(events, "Bajamar") ?? null;

  qs("[data-tide-state]").textContent = stateNow.label;
  qs("[data-tide-height]").textContent = stateNow.height == null ? "-- m marea" : `${stateNow.height.toFixed(2)} m marea`;
  qs("[data-tide-hand]").style.setProperty("--angle", `${stateNow.angle}deg`);
  const marineDistance = marinePoint?.fallback
    ? `, usando referencia costera ${marinePoint.label}`
    : marinePoint?.distanceKm ? `, usando una celda marina a unos ${Math.round(marinePoint.distanceKm)} km` : "";
  qs("[data-tide-summary]").textContent = `Datos reales consultados para el mar mas cercano a tu ubicacion${marineDistance}. Ahora la marea esta ${stateNow.label.toLowerCase()} con ${stateNow.height == null ? "--" : stateNow.height.toFixed(2)} m. Oleaje estimado: ${stateNow.wave == null ? "--" : `${stateNow.wave.toFixed(1)} m`}.`;
  qs("[data-next-high]").textContent = highForDisplay ? `${formatHour(highForDisplay.time)} - ${highForDisplay.height.toFixed(2)} m` : "--:--";
  qs("[data-next-low]").textContent = lowForDisplay ? `${formatHour(lowForDisplay.time)} - ${lowForDisplay.height.toFixed(2)} m` : "--:--";
  qs("[data-clock-date]").textContent = formatDate(new Date());
  qs("[data-clock-evening]").textContent = "18:00";
  qs("[data-user-coords]").textContent = data.userPoint ? `${data.userPoint.latitude.toFixed(3)}, ${data.userPoint.longitude.toFixed(3)}` : "--";
  qs("[data-sea-coords]").textContent = marinePoint ? `${marinePoint.latitude.toFixed(3)}, ${marinePoint.longitude.toFixed(3)}` : "--";
  qs("[data-sea-distance]").textContent = marinePoint?.fallback ? "referencia costera" : marinePoint?.distanceKm ? `${Math.round(marinePoint.distanceKm)} km aprox.` : "misma zona";
  qs("[data-wind-now]").textContent = wind?.now?.speed == null ? "--" : `${Math.round(wind.now.speed)} km/h ${windDirectionLabel(wind.now.direction ?? 0)}`;
  qs("[data-wind-three-days]").textContent = wind?.threeDays?.value == null ? "--" : `${Math.round(wind.threeDays.value)} km/h ${windDirectionLabel(wind.threeDays.direction ?? 0)}`;
  qs("[data-wind-source]").textContent = wind?.threeDays?.time ? `Pronostico para ${formatDate(wind.threeDays.time)} a las ${formatHour(wind.threeDays.time)}.` : "Pronostico no disponible.";
  const moon = moonPhaseInfo();
  const moonVisual = qs("[data-moon-visual]");
  qs("[data-sun-window]").textContent = sunrise && sunset ? `${formatHour(sunrise)} / ${formatHour(sunset)}` : "--";
  qs("[data-moon-phase]").textContent = moon.name;
  if (moonVisual) {
    moonVisual.className = `moon-visual ${moon.className}`;
  }

  source.textContent = `Fuente: Open-Meteo Marine y Weather con modelos DWD/ECMWF/GFS segun disponibilidad. Datos reales consultados hoy (${formatDate(new Date())}) para el mar mas cercano${marineDistance}; se actualizan al abrir la pagina y luego automaticamente cada dia. No apto para navegacion.`;
  state.tideData = data;
  renderTideRange(data);
}

function setupTideDashboard() {
  const button = qs("[data-update-tides]");
  const source = qs("[data-tide-source]");
  if (!button || !source) return;
  const daysRange = qs("[data-tide-days]");
  const dayButtons = qs("[data-tide-day-buttons]");
  let lastCoords = null;
  let refreshTimer = null;

  if (dayButtons) {
    dayButtons.innerHTML = Array.from({ length: 7 }, (_, index) => {
      const day = index + 1;
      return `<button type="button" data-tide-day="${day}"${day === state.tideDays ? " class=\"active\"" : ""}>${day}d</button>`;
    }).join("");
  }

  const setTideDays = (days) => {
    state.tideDays = clamp(Number(days) || 1, 1, 7);
    if (daysRange) daysRange.value = String(state.tideDays);
    qsa("[data-tide-day]").forEach((item) => item.classList.toggle("active", Number(item.dataset.tideDay) === state.tideDays));
    if (state.tideData) renderTideRange(state.tideData);
  };

  daysRange?.addEventListener("input", (event) => setTideDays(event.target.value));
  dayButtons?.addEventListener("click", (event) => {
    const buttonTarget = event.target.closest("[data-tide-day]");
    if (buttonTarget) setTideDays(buttonTarget.dataset.tideDay);
  });

  const loadTides = async (latitude, longitude) => {
    const data = await fetchTideDashboard(latitude.toFixed(4), longitude.toFixed(4));
    renderTideDashboard(data);
  };

  const scheduleDailyRefresh = () => {
    window.clearTimeout(refreshTimer);
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setDate(now.getDate() + 1);
    nextRun.setHours(0, 5, 0, 0);
    refreshTimer = window.setTimeout(async () => {
      if (lastCoords) {
        try {
          await loadTides(lastCoords.latitude, lastCoords.longitude);
        } catch {
          source.textContent = "No se pudieron refrescar las mareas del dia. Usa actualizar para reintentar.";
        }
      }
      scheduleDailyRefresh();
    }, Math.max(nextRun.getTime() - now.getTime(), 60 * 60 * 1000));
  };

  const updateFromLocation = () => {
    if (!navigator.geolocation) {
      lastCoords = { ...fallbackCoastalPoint };
      source.textContent = "Tu navegador no permite geolocalizacion. Mostrando referencia costera.";
      loadTides(fallbackCoastalPoint.latitude, fallbackCoastalPoint.longitude).catch(() => {
        source.textContent = "No se pudieron cargar mareas. Revisa internet y vuelve a intentar.";
      });
      return;
    }

    button.disabled = true;
    source.textContent = "Pidiendo ubicacion y consultando mareas...";

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        lastCoords = { latitude, longitude };
        await loadTides(latitude, longitude);
        scheduleDailyRefresh();
      } catch (error) {
        source.textContent = "No se pudieron cargar mareas para esta ubicacion. Prueba cerca de costa abierta.";
      } finally {
        button.disabled = false;
      }
    }, () => {
      lastCoords = { ...fallbackCoastalPoint };
      source.textContent = "Permiso de ubicacion rechazado. Mostrando referencia costera; presiona actualizar y permite ubicacion para datos locales.";
      loadTides(fallbackCoastalPoint.latitude, fallbackCoastalPoint.longitude)
        .then(scheduleDailyRefresh)
        .catch(() => {
          source.textContent = "No se pudieron cargar mareas. Revisa internet y vuelve a intentar.";
        })
        .finally(() => {
          button.disabled = false;
        });
    }, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 15 * 60 * 1000
    });
  };

  button.addEventListener("click", updateFromLocation);
  setTideDays(state.tideDays);
  window.setTimeout(updateFromLocation, 600);
  window.setInterval(() => {
    if (lastCoords) loadTides(lastCoords.latitude, lastCoords.longitude).catch(() => {});
  }, 60 * 60 * 1000);
}

function renderVideos() {
  const grid = qs("[data-videos]");
  if (!grid) return;
  grid.innerHTML = videos.map((video) => `
    <article class="video-card reveal visible">
      <div class="video-frame">
        <iframe
          src="${video.embed}"
          title="${video.title}"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen>
        </iframe>
      </div>
      <div class="video-body">
        <span>${video.type}</span>
        <h3>${video.title}</h3>
      </div>
    </article>
  `).join("");
}

function updateCartPanel() {
  const items = qs("[data-cart-items]");
  const total = qs("[data-cart-total]");
  const checkoutForm = qs("[data-checkout-form]");
  if (!items || !total) return;
  const setCheckoutDisabled = (disabled) => {
    checkoutForm?.classList.toggle("is-disabled", disabled);
    qsa("input, textarea, button", checkoutForm).forEach((control) => {
      control.disabled = disabled;
    });
  };

  if (!state.cart.length) {
    items.textContent = "Tu carrito esta vacio.";
    total.textContent = money(0);
    setCheckoutDisabled(true);
    return;
  }

  setCheckoutDisabled(false);
  items.innerHTML = state.cart.map((line) => {
    const product = products.find((item) => item.id === line.id);
    if (!product) return "";
    return `
    <div class="cart-line">
      <span>${product.name}<small>${line.quantity} x ${money(product.price)}</small></span>
      <div>
        <strong>${money(product.price * line.quantity)}</strong>
        <button type="button" aria-label="Quitar ${product.name}" data-remove-cart="${product.id}">Quitar</button>
      </div>
    </div>
  `;
  }).join("");
  const totalValue = state.cart.reduce((sum, line) => {
    const product = products.find((item) => item.id === line.id);
    return sum + (product ? product.price * line.quantity : 0);
  }, 0);
  total.textContent = money(totalValue);
}

function addToCart(productId, quantity = 1) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  const amount = clamp(Number(quantity) || 1, 1, product.stock);
  const existing = state.cart.find((line) => line.id === productId);
  if (existing) {
    existing.quantity = clamp(existing.quantity + amount, 1, product.stock);
  } else {
    state.cart.push({ id: productId, quantity: amount });
  }
  updateCartPanel();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((line) => line.id !== productId);
  updateCartPanel();
}

function cartSummary() {
  const lines = state.cart.map((line) => {
    const product = products.find((item) => item.id === line.id);
    if (!product) return null;
    return {
      product,
      quantity: line.quantity,
      subtotal: product.price * line.quantity
    };
  }).filter(Boolean);
  const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
  return { lines, total };
}

function renderProducts() {
  const grid = qs("[data-products]");
  if (!grid) return;
  const filtered = products.filter((product) => {
    const byCategory = state.filter === "all" || product.category === state.filter;
    const text = `${product.name} ${product.tag} ${product.use} ${product.detail} ${product.specs.join(" ")}`.toLowerCase();
    return byCategory && text.includes(state.query);
  });

  grid.innerHTML = filtered.map((product) => `
    <article class="product-card reveal visible">
      <div class="product-media">
        <img src="${product.image}" alt="${product.name}">
        <span class="tag">${product.tag}</span>
      </div>
      <div class="product-body">
        <span>${product.category}</span>
        <h3>${product.name}</h3>
        <p>${product.use}</p>
        <ul class="product-specs">
          ${product.specs.map((spec) => `<li>${spec}</li>`).join("")}
        </ul>
        <div class="product-buy-row">
          <strong>${money(product.price)}</strong>
          <small>${product.stock} disponibles</small>
        </div>
        <label class="quantity-field">Cantidad
          <input type="number" min="1" max="${product.stock}" value="1" data-product-qty="${product.id}">
        </label>
        <div class="product-actions">
          <a class="button ghost shop-link" href="producto.html?id=${product.id}">Ver detalle</a>
          <button class="button primary shop-link" type="button" data-add-cart="${product.id}">Agregar al carrito</button>
          <a class="button ghost shop-link" href="${productEmailUrl(product)}" data-product-mail="${product.id}">Comprar por correo</a>
        </div>
      </div>
    </article>
  `).join("");

  updateCartPanel();
}

function setupProductShop() {
  const grid = qs("[data-products]");
  grid?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-cart]");
    if (button) {
      const quantity = qs(`[data-product-qty="${button.dataset.addCart}"]`)?.value;
      addToCart(button.dataset.addCart, quantity);
    }
  });

  grid?.addEventListener("input", (event) => {
    const link = event.target.closest("[data-product-qty]");
    if (!link) return;
    const product = products.find((item) => item.id === link.dataset.productQty);
    const mail = qs(`[data-product-mail="${link.dataset.productQty}"]`);
    if (product && mail) mail.href = productEmailUrl(product, Number(link.value) || 1);
  });

  qs("[data-cart-panel]")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-cart]");
    if (button) removeFromCart(button.dataset.removeCart);
  });
}

function renderProductDetail() {
  const detail = qs("[data-product-detail]");
  if (!detail) return;
  const params = new URLSearchParams(window.location.search);
  const product = products.find((item) => item.id === params.get("id")) ?? products[0];
  detail.innerHTML = `
    <div class="product-detail-media reveal visible">
      <img src="${product.image}" alt="${product.name}">
    </div>
    <article class="product-detail-card reveal visible">
      <span>${product.category} / ${product.tag}</span>
      <h1>${product.name}</h1>
      <p>${product.detail}</p>
      <dl>
        <div><dt>Precio</dt><dd>${money(product.price)}</dd></div>
        <div><dt>Stock</dt><dd>${product.stock} unidades</dd></div>
        <div><dt>Entrega</dt><dd>Coordinar por correo</dd></div>
      </dl>
      <div class="detail-specs">
        <h2>Especificaciones</h2>
        <ul>
          ${product.specs.map((spec) => `<li>${spec}</li>`).join("")}
        </ul>
      </div>
      <label class="quantity-field">Cantidad
        <input type="number" min="1" max="${product.stock}" value="1" data-detail-qty>
      </label>
      <div class="product-detail-actions">
        <button class="button primary" type="button" data-detail-cart="${product.id}">Agregar al carrito</button>
        <a class="button ghost" href="${productEmailUrl(product)}" data-detail-mail>Comprar por correo</a>
        <a class="button ghost" href="productos.html">Volver a tienda</a>
      </div>
    </article>
  `;
  qs("[data-detail-cart]")?.addEventListener("click", () => addToCart(product.id, qs("[data-detail-qty]")?.value));
  qs("[data-detail-qty]")?.addEventListener("input", (event) => {
    const quantity = Number(event.target.value) || 1;
    qs("[data-detail-mail]").href = productEmailUrl(product, quantity);
  });
}

function setupHeader() {
  const header = qs("[data-header]");
  const toggle = qs("[data-nav-toggle]");
  const nav = qs("[data-nav]");
  const isHomePage = Boolean(qs(".hero"));

  const syncHeader = () => header.classList.toggle("scrolled", !isHomePage || window.scrollY > 20);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  toggle.addEventListener("click", () => {
    const open = !document.body.classList.contains("menu-open");
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      document.body.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  qsa(".reveal").forEach((element) => observer.observe(element));
}

function setupCursorGlow() {
  const glow = qs(".cursor-glow");
  window.addEventListener("pointermove", (event) => {
    glow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate3d(-50%, -50%, 0)`;
  }, { passive: true });
}

function setupCatalog() {
  if (!qs("[data-products]")) return;
  qsa("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      qsa("[data-filter]").forEach((item) => item.classList.toggle("active", item === button));
      renderProducts();
    });
  });

  const search = qs("[data-search]");
  if (!search) return;

  search.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    renderProducts();
  });
}

function setupContactForm() {
  const form = qs("[data-contact-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = data.get("name");
    const email = data.get("email");
    const message = data.get("message");
    const body = [
      "Hola AltaFishing,",
      "",
      message,
      "",
      `Nombre: ${name}`,
      `Correo: ${email}`
    ].join("\n");
    window.location.href = mailtoUrl(`Contacto AltaFishing - ${name}`, body);
    qs("[data-form-message]").textContent = "Se preparo el correo para contactoaltafishing@gmail.com.";
  });
}

function setupCheckoutForm() {
  const form = qs("[data-checkout-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const feedback = qs("[data-checkout-message]");
    if (!state.cart.length) {
      feedback.textContent = "Agrega productos al carrito antes de enviar el pedido.";
      return;
    }

    const data = new FormData(event.currentTarget);
    const { lines, total } = cartSummary();
    const orderLines = lines.map((line) => (
      `- ${line.product.name} | Cantidad: ${line.quantity} | Subtotal: ${money(line.subtotal)}`
    ));
    const body = [
      "Hola AltaFishing, quiero realizar este pedido:",
      "",
      ...orderLines,
      "",
      `Total estimado: ${money(total)}`,
      "",
      `Nombre: ${data.get("customerName")}`,
      `Correo: ${data.get("customerEmail")}`,
      `Entrega: ${data.get("delivery")}`,
      "",
      "Quedo atento/a para coordinar pago y confirmacion de stock."
    ].join("\n");

    window.location.href = mailtoUrl("Pedido desde tienda AltaFishing", body);
    feedback.textContent = "Se preparo el correo del pedido para AltaFishing.";
  });
}

function drawWaves() {
  const canvas = qs("#waveCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let tick = 0;

  const resize = () => {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  };

  const render = () => {
    tick += 0.008;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let line = 0; line < 7; line += 1) {
      ctx.beginPath();
      const yBase = h * 0.55 + line * 35;
      for (let x = 0; x <= w; x += 18) {
        const y = yBase + Math.sin(x * 0.012 + tick * 3 + line) * (12 + line * 2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(217, 238, 251, ${0.09 + line * 0.018})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    requestAnimationFrame(render);
  };

  resize();
  window.addEventListener("resize", resize);
  render();
}

document.addEventListener("DOMContentLoaded", () => {
  setupHeader();
  setupReveal();
  setupCursorGlow();
  setupCatalog();
  setupContactForm();
  setupCheckoutForm();
  setupProductShop();
  setupFishingConditions();
  setupTideDashboard();
  renderVideos();
  renderProducts();
  renderProductDetail();
  drawWaves();
});
