/* =====================================================
   NER-X LANDSLIDE COMMAND CENTER

   IMPORTANT:
   NO RANDOM SENSOR DATA.

   Real sensor/backend should call:

   updateSensorData({...});

===================================================== */


/* =====================================================
   GLOBAL
===================================================== */

const NER_CENTER = [25.5, 93.5];

let map;
let bigMap;
let routeMap;

let sensorMarkers = [];

let riskRoadLayers = [];

let safeRouteLayers = [];

let latestSensorData = null;


/* =====================================================
   SIDEBAR
===================================================== */

const navItems =
    document.querySelectorAll(".nav-item");

const views =
    document.querySelectorAll(".view");


navItems.forEach(button => {

    button.addEventListener("click", () => {

        const target =
            button.dataset.view;


        navItems.forEach(item => {

            item.classList.remove("active");

        });


        button.classList.add("active");


        views.forEach(view => {

            view.classList.remove(
                "active-view"
            );

        });


        const selected =
            document.getElementById(target);


        if (selected) {

            selected.classList.add(
                "active-view"
            );

        }


        setTimeout(() => {

            if (target === "dashboard") {

                map.invalidateSize();

            }


            if (target === "riskmap") {

                bigMap.invalidateSize();

            }


            if (target === "routes") {

                routeMap.invalidateSize();

            }

        }, 200);

    });

});


/* =====================================================
   CLOCK
===================================================== */

function updateClock() {

    const clock =
        document.getElementById("clock");

    if (clock) {

        clock.textContent =
            new Date().toLocaleTimeString();

    }

}


setInterval(
    updateClock,
    1000
);

updateClock();


/* =====================================================
   MAP CREATION
===================================================== */

function createMap(
    elementId,
    zoom
) {

    const newMap =
        L.map(elementId).setView(
            NER_CENTER,
            zoom
        );


   L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        maxZoom: 19,
        attribution: "Tiles &copy; Esri"
    }
).addTo(newMap);


    return newMap;

}


map =
    createMap(
        "map",
        6
    );


bigMap =
    createMap(
        "bigMap",
        6
    );


routeMap =
    createMap(
        "routeMap",
        6
    );


/* =====================================================
   NER STATES
===================================================== */

const nerStates = [

    [
        "Arunachal Pradesh",
        28.2180,
        94.7278
    ],

    [
        "Assam",
        26.2006,
        92.9376
    ],

    [
        "Meghalaya",
        25.4670,
        91.3662
    ],

    [
        "Nagaland",
        26.1584,
        94.5624
    ],

    [
        "Manipur",
        24.6637,
        93.9063
    ],

    [
        "Mizoram",
        23.1645,
        92.9376
    ],

    [
        "Tripura",
        23.9408,
        91.9882
    ],

    [
        "Sikkim",
        27.5330,
        88.5122
    ]

];


function addStateMarkers(targetMap) {

    nerStates.forEach(state => {

        L.circleMarker(

            [
                state[1],
                state[2]
            ],

            {

                radius: 4,

                color: "#00e5ff",

                fillColor: "#00e5ff",

                fillOpacity: .65

            }

        )
        .addTo(targetMap)
        .bindTooltip(
            state[0]
        );

    });

}


addStateMarkers(map);
addStateMarkers(bigMap);
addStateMarkers(routeMap);


/* =====================================================
   RISK DISTANCE
===================================================== */

function getRiskDistance(score) {

    score = Number(score);


    if (!Number.isFinite(score)) {

        return 0;

    }


    /*
       SAME RISK DISTANCE
       IS USED FOR ROAD DETECTION.

       CRITICAL = 1500 m
       WARNING  = 1000 m
       WATCH    = 500 m
    */


    if (score >= 75) {

        return 1500;

    }


    if (score >= 50) {

        return 1000;

    }


    if (score >= 25) {

        return 500;

    }


    return 0;

}


/* =====================================================
   RISK STATUS
===================================================== */

function getRiskStatus(score) {

    score =
        Number(score);


    if (!Number.isFinite(score)) {

        return "WAITING";

    }


    if (score >= 75) {

        return "CRITICAL";

    }


    if (score >= 50) {

        return "WARNING";

    }


    if (score >= 25) {

        return "WATCH";

    }


    return "SAFE";

}


/* =====================================================
   REAL SENSOR DATA
===================================================== */

async function updateSensorData(data) {

    latestSensorData =
        data;


    const score =
        Number(data.riskScore);


    /* ---------------------------------------------
       SENSOR CARDS
    --------------------------------------------- */

    setText(
        "sensorRain",
        value(data.rainfall)
    );


    setText(
        "sensorSoil",
        value(data.soilMoisture)
    );


    setText(
        "sensorTilt",
        value(data.tilt)
    );


    setText(
        "sensorMotion",
        value(data.groundMotion)
    );


    setText(
        "sensorTemp",
        value(data.temperature)
    );


    setText(
        "sensorHumidity",
        value(data.humidity)
    );


    /* ---------------------------------------------
       DASHBOARD
    --------------------------------------------- */

    setText(
        "riskScore",
        Number.isFinite(score)
            ? score
            : "--"
    );


    setText(
        "riskRingValue",
        Number.isFinite(score)
            ? score
            : "--"
    );


    setText(
        "mapRisk",
        Number.isFinite(score)
            ? score
            : "--"
    );


    setText(
        "highestZone",
        data.location ||
        "UNKNOWN"
    );


    setText(
        "highestZoneStatus",
        getRiskStatus(score)
    );


    setText(
        "activeSensors",
        "1"
    );


    setText(
        "mapSensors",
        "1"
    );


    setText(
        "sensorStatus",
        "LIVE"
    );


    setText(
        "lastUpdate",
        data.timestamp ||
        new Date().toLocaleTimeString()
    );


    /* ---------------------------------------------
       RISK DISTANCE
    --------------------------------------------- */

    const distance =
        getRiskDistance(score);


    setText(
        "riskDistance",
        distance
            ? `${distance} m`
            : "--"
    );


    /* ---------------------------------------------
       FACTORS
    --------------------------------------------- */

    setText(
        "rainValue",
        value(data.rainfall)
    );


    setText(
        "soilValue",
        value(data.soilMoisture)
    );


    setText(
        "tiltValue",
        value(data.tilt)
    );


    setText(
        "motionValue",
        value(data.groundMotion)
    );


    updateBar(
        "rainBar",
        normalize(
            data.rainfall,
            0,
            100
        )
    );


    updateBar(
        "soilBar",
        normalize(
            data.soilMoisture,
            0,
            100
        )
    );


    updateBar(
        "tiltBar",
        normalize(
            data.tilt,
            0,
            10
        )
    );


    updateBar(
        "motionBar",
        normalize(
            data.groundMotion,
            0,
            20
        )
    );


    /* ---------------------------------------------
       SENSOR HEALTH
    --------------------------------------------- */

    setText(
        "rainHealth",
        "ONLINE"
    );

    setText(
        "soilHealth",
        "ONLINE"
    );

    setText(
        "tiltHealth",
        "ONLINE"
    );

    setText(
        "motionHealth",
        "ONLINE"
    );

    setText(
        "tempHealth",
        "ONLINE"
    );

    setText(
        "humidityHealth",
        "ONLINE"
    );


    /* ---------------------------------------------
       GPS
    --------------------------------------------- */

    if (
        Number.isFinite(
            Number(data.latitude)
        ) &&
        Number.isFinite(
            Number(data.longitude)
        )
    ) {

        addSensorMarker(data);


        /*
           Only show risk roads when
           risk is >= WATCH.
        */

        if (score >= 25) {

            await showRiskRoads(
                Number(data.latitude),
                Number(data.longitude),
                score
            );

        }

    }


    /* ---------------------------------------------
       ALERT
    --------------------------------------------- */

    updateAlert(data);

}


/* =====================================================
   SENSOR MARKER
===================================================== */

function addSensorMarker(data) {

    /*
       Remove old markers
    */

    sensorMarkers.forEach(marker => {

        map.removeLayer(marker);

        bigMap.removeLayer(marker);

    });


    sensorMarkers = [];


    const score =
        Number(data.riskScore);


    const status =
        getRiskStatus(score);


    let color =
        "#00e676";


    if (status === "CRITICAL") {

        color =
            "#ff304f";

    }

    else if (status === "WARNING") {

        color =
            "#ff9800";

    }

    else if (status === "WATCH") {

        color =
            "#ffe600";

    }


    const options = {

        radius: 11,

        color: color,

        fillColor: color,

        fillOpacity: .95,

        weight: 3

    };


    const popup = `

        <div>

            <b>
                📡 ${data.sensorId || "SENSOR"}
            </b>

            <br><br>

            <b>
                Location:
            </b>

            ${data.location || "Unknown"}

            <br>

            <b>
                Risk:
            </b>

            ${Number.isFinite(score)
                ? score
                : "--"} / 100

            <br>

            <b>
                Status:
            </b>

            ${status}

            <br><br>

            Rainfall:
            ${value(data.rainfall)}
            mm/hr

            <br>

            Soil:
            ${value(data.soilMoisture)}
            %

            <br>

            Tilt:
            ${value(data.tilt)}
            °

            <br>

            Ground Motion:
            ${value(data.groundMotion)}
            mm

        </div>

    `;


    const marker1 =
        L.circleMarker(

            [
                data.latitude,
                data.longitude
            ],

            options

        )
        .addTo(map);


    const marker2 =
        L.circleMarker(

            [
                data.latitude,
                data.longitude
            ],

            options

        )
        .addTo(bigMap);


    marker1.bindPopup(popup);

    marker2.bindPopup(popup);


    sensorMarkers.push(
        marker1,
        marker2
    );


    map.setView(
        [
            data.latitude,
            data.longitude
        ],
        11
    );


    bigMap.setView(
        [
            data.latitude,
            data.longitude
        ],
        11
    );

}


/* =====================================================
   REAL ROAD RISK
===================================================== */

async function showRiskRoads(
    latitude,
    longitude,
    riskScore
) {

    /*
       Remove previous risk roads
    */

    riskRoadLayers.forEach(layer => {

        map.removeLayer(layer);

        bigMap.removeLayer(layer);

        routeMap.removeLayer(layer);

    });


    riskRoadLayers = [];


    const radius =
        getRiskDistance(
            riskScore
        );


    if (radius <= 0) {

        return;

    }


    /* ---------------------------------------------
       RISK CIRCLE
    --------------------------------------------- */

    let riskColor =
        "#ffe600";


    if (riskScore >= 75) {

        riskColor =
            "#ff304f";

    }

    else if (riskScore >= 50) {

        riskColor =
            "#ff9800";

    }


    const circleOptions = {

        radius: radius,

        color: riskColor,

        fillColor: riskColor,

        fillOpacity: .07,

        weight: 2

    };


    const c1 =
        L.circle(
            [latitude, longitude],
            circleOptions
        ).addTo(map);


    const c2 =
        L.circle(
            [latitude, longitude],
            circleOptions
        ).addTo(bigMap);


    const c3 =
        L.circle(
            [latitude, longitude],
            circleOptions
        ).addTo(routeMap);


    riskRoadLayers.push(
        c1,
        c2,
        c3
    );


    /* ---------------------------------------------
       GET ACTUAL OSM ROADS
    --------------------------------------------- */

    const query = `

        [out:json];

        way
        ["highway"]
        (around:${radius},${latitude},${longitude});

        out geom;

    `;


    try {

        const response =
            await fetch(
                "https://overpass-api.de/api/interpreter",
                {

                    method: "POST",

                    body:
                        new URLSearchParams({
                            data: query
                        })

                }
            );


        if (!response.ok) {

            throw new Error(
                "OSM road data unavailable"
            );

        }


        const result =
            await response.json();


        result.elements.forEach(
            road => {

                if (!road.geometry) {

                    return;

                }


                const points =
                    road.geometry;


                /*
                   SPLIT EACH ROAD INTO
                   SMALL SEGMENTS.

                   This prevents the entire
                   road from becoming red.
                */

                for (
                    let i = 0;
                    i < points.length - 1;
                    i++
                ) {

                    const p1 =
                        points[i];

                    const p2 =
                        points[i + 1];


                    const distance1 =
                        calculateDistance(
                            latitude,
                            longitude,
                            p1.lat,
                            p1.lon
                        );


                    const distance2 =
                        calculateDistance(
                            latitude,
                            longitude,
                            p2.lat,
                            p2.lon
                        );


                    /*
                       MIDPOINT DISTANCE

                       Only the road section
                       physically inside the
                       selected risk distance
                       gets risk colour.
                    */

                    const midLat =
                        (
                            p1.lat +
                            p2.lat
                        ) / 2;


                    const midLon =
                        (
                            p1.lon +
                            p2.lon
                        ) / 2;


                    const midpointDistance =
                        calculateDistance(
                            latitude,
                            longitude,
                            midLat,
                            midLon
                        );


                    if (
                        midpointDistance >
                        radius
                    ) {

                        /*
                           Outside risk radius.

                           DO NOT COLOUR IT.

                           Therefore normal OSM
                           road appearance remains.
                        */

                        continue;

                    }


                    const roadName =
                        road.tags?.name ||
                        "Unnamed Road";


                    const roadType =
                        road.tags?.highway ||
                        "Road";


                    let status =
                        "WATCH ROAD";


                    if (riskScore >= 75) {

                        status =
                            "DANGER ROAD";

                    }

                    else if (riskScore >= 50) {

                        status =
                            "WARNING ROAD";

                    }


                    const popup = `

                        <b>
                            ${status}
                        </b>

                        <br><br>

                        Road:
                        ${roadName}

                        <br>

                        Type:
                        ${roadType}

                        <br>

                        Risk:
                        ${riskScore}/100

                        <br>

                        Risk Distance:
                        ${radius} m

                    `;


                    const coordinates = [

                        [
                            p1.lat,
                            p1.lon
                        ],

                        [
                            p2.lat,
                            p2.lon
                        ]

                    ];


                    /*
                       ONLY THIS ROAD SEGMENT
                       GETS RISK COLOUR.
                    */

                    const line1 =
                        L.polyline(
                            coordinates,
                            {

                                color:
                                    riskColor,

                                weight: 7,

                                opacity: 1

                            }
                        )
                        .addTo(map)
                        .bindPopup(popup);


                    const line2 =
                        L.polyline(
                            coordinates,
                            {

                                color:
                                    riskColor,

                                weight: 7,

                                opacity: 1

                            }
                        )
                        .addTo(bigMap)
                        .bindPopup(popup);


                    const line3 =
                        L.polyline(
                            coordinates,
                            {

                                color:
                                    riskColor,

                                weight: 7,

                                opacity: 1

                            }
                        )
                        .addTo(routeMap)
                        .bindPopup(popup);


                    riskRoadLayers.push(
                        line1,
                        line2,
                        line3
                    );

                }

            }
        );


    }

    catch (error) {

        console.error(
            "OSM road error:",
            error
        );

    }

}


/* =====================================================
   SAFE ROUTE
===================================================== */

async function findSafeRoute() {

    const start =
        document
            .getElementById(
                "startLocation"
            )
            .value
            .trim();


    const destination =
        document
            .getElementById(
                "destination"
            )
            .value
            .trim();


    const result =
        document.getElementById(
            "routeResult"
        );


    if (!start || !destination) {

        result.textContent =
            "Please enter start and destination.";

        return;

    }


    result.textContent =
        "Finding alternative routes...";


    /*
       Remove old safe route
    */

    safeRouteLayers.forEach(
        layer => {

            routeMap.removeLayer(
                layer
            );

        }
    );


    safeRouteLayers = [];


    try {

        /*
           Convert start/destination
           into GPS.
        */

        const startGPS =
            await getCoordinates(
                start
            );


        const destinationGPS =
            await getCoordinates(
                destination
            );


        if (
            !startGPS ||
            !destinationGPS
        ) {

            result.textContent =
                "Could not find one of the locations.";

            return;

        }


        /*
           Actual OSRM road routing
        */

        const routeURL =

            "https://router.project-osrm.org/route/v1/driving/" +

            `${startGPS.lon},${startGPS.lat};` +

            `${destinationGPS.lon},${destinationGPS.lat}` +

            "?alternatives=true" +

            "&overview=full" +

            "&geometries=geojson";


        const response =
            await fetch(
                routeURL
            );


        if (!response.ok) {

            throw new Error(
                "Routing service unavailable"
            );

        }


        const routeData =
            await response.json();


        if (
            !routeData.routes ||
            routeData.routes.length === 0
        ) {

            result.textContent =
                "No road route found.";

            return;

        }


        /*
           Find the route that has
           minimum exposure to the
           current danger radius.
        */

        let selectedRoute =
            routeData.routes[0];


        let selectedExposure =
            Infinity;


        routeData.routes.forEach(
            route => {

                const exposure =
                    calculateRouteExposure(
                        route,
                        latestSensorData
                    );


                if (
                    exposure <
                    selectedExposure
                ) {

                    selectedExposure =
                        exposure;

                    selectedRoute =
                        route;

                }

            }
        );


        /*
           Draw ONLY selected route
           as GREEN.
        */

        const safeLayer =
            L.geoJSON(
                selectedRoute.geometry,
                {

                    style: {

                        color:
                            "#00e676",

                        weight: 8,

                        opacity: 1

                    }

                }
            )
            .addTo(routeMap);


        safeRouteLayers.push(
            safeLayer
        );


        routeMap.fitBounds(
            safeLayer.getBounds(),
            {

                padding: [
                    30,
                    30
                ]

            }
        );


        const distanceKm =
            (
                selectedRoute.distance /
                1000
            ).toFixed(2);


        const durationMin =
            (
                selectedRoute.duration /
                60
            ).toFixed(0);


        const exposureText =
            selectedExposure === 0
                ? "Avoids the current risk radius."
                : "Lowest available exposure to the current risk radius.";


        result.innerHTML = `

            <b>
                🟢 SAFE ALTERNATIVE ROUTE
            </b>

            <br><br>

            From:
            ${start}

            <br>

            To:
            ${destination}

            <br><br>

            Distance:
            ${distanceKm} km

            <br>

            Estimated Time:
            ${durationMin} minutes

            <br><br>

            ${exposureText}

        `;


        document.getElementById(
            "routeA"
        ).textContent =

            `${start} → ${destination} • ${distanceKm} km`;


        document.getElementById(
            "routeB"
        ).textContent =

            routeData.routes.length > 1
                ? "Alternative road available"
                : "No second alternative returned";


    }

    catch (error) {

        console.error(
            error
        );

        result.textContent =
            "Unable to calculate route.";

    }

}


/* =====================================================
   ROUTE EXPOSURE
===================================================== */

function calculateRouteExposure(
    route,
    sensorData
) {

    /*
       If there is no live sensor,
       don't pretend there is a danger zone.
    */

    if (
        !sensorData ||
        sensorData.latitude === undefined ||
        sensorData.longitude === undefined
    ) {

        return 0;

    }


    const score =
        Number(
            sensorData.riskScore
        );


    if (
        !Number.isFinite(score) ||
        score < 25
    ) {

        return 0;

    }


    const radius =
        getRiskDistance(
            score
        );


    const sensorLat =
        Number(
            sensorData.latitude
        );


    const sensorLon =
        Number(
            sensorData.longitude
        );


    const coordinates =
        route.geometry.coordinates;


    let exposure =
        0;


    /*
       Count route points that
       enter the risk radius.
    */

    coordinates.forEach(
        point => {

            const distance =
                calculateDistance(
                    sensorLat,
                    sensorLon,
                    point[1],
                    point[0]
                );


            if (
                distance <= radius
            ) {

                exposure++;

            }

        }
    );


    return exposure;

}


/* =====================================================
   LOCATION SEARCH
===================================================== */

async function getCoordinates(
    place
) {

    const url =

        "https://nominatim.openstreetmap.org/search" +

        "?format=json" +

        "&limit=1" +

        "&q=" +

        encodeURIComponent(place);


    const response =
        await fetch(
            url,
            {

                headers: {

                    "Accept":
                        "application/json"

                }

            }
        );


    if (!response.ok) {

        return null;

    }


    const data =
        await response.json();


    if (!data.length) {

        return null;

    }


    return {

        lat:
            Number(
                data[0].lat
            ),

        lon:
            Number(
                data[0].lon
            )

    };

}


/* =====================================================
   DISTANCE
===================================================== */

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R =
        6371000;


    const dLat =
        (
            lat2 -
            lat1
        ) *
        Math.PI /
        180;


    const dLon =
        (
            lon2 -
            lon1
        ) *
        Math.PI /
        180;


    const a =

        Math.sin(
            dLat / 2
        ) ** 2

        +

        Math.cos(
            lat1 *
            Math.PI /
            180
        )

        *

        Math.cos(
            lat2 *
            Math.PI /
            180
        )

        *

        Math.sin(
            dLon / 2
        ) ** 2;


    return (

        R *

        2 *

        Math.atan2(

            Math.sqrt(a),

            Math.sqrt(
                1 - a
            )

        )

    );

}


/* =====================================================
   ALERT
===================================================== */

function updateAlert(
    data
) {

    const score =
        Number(
            data.riskScore
        );


    const level =
        document.getElementById(
            "alertLevel"
        );


    const message =
        document.getElementById(
            "alertMessage"
        );


    if (
        !Number.isFinite(score)
    ) {

        level.textContent =
            "NO ACTIVE ALERT";

        message.textContent =
            "Waiting for real sensor event.";

        return;

    }


    if (score >= 75) {

        level.textContent =
            "🚨 CRITICAL ALERT";


        message.textContent =
            `High-risk road section detected within ${
                getRiskDistance(score)
            } m of ${
                data.location ||
                "sensor location"
            }.`;

    }

    else if (score >= 50) {

        level.textContent =
            "🟠 WARNING";


        message.textContent =
            `Warning road section detected within ${
                getRiskDistance(score)
            } m of the sensor.`;

    }

    else if (score >= 25) {

        level.textContent =
            "🟡 WATCH";


        message.textContent =
            `Road section is being monitored within ${
                getRiskDistance(score)
            } m.`;

    }

    else {

        level.textContent =
            "🟢 SAFE";


        message.textContent =
            "No current high-risk road section detected.";

    }

}


/* =====================================================
   PYTHON ML BACKEND CONNECTION
===================================================== */

const ML_API_URL = "https://landslide-ai.onrender.com/predict";

async function runDemoPrediction() {

    const sampleData = {
        sensorId: "DEMO-SENSOR-01",
        location: "Assam",
        latitude: 26.2006,
        longitude: 92.9376,
        rainfall: 85,
        soilMoisture: 92,
        slope: 28,
        elevation: 1400,
        temperature: 21,
        tilt: 7.2,
        groundMotion: 12,
        humidity: 82,
        timestamp: new Date().toLocaleString()
    };

    try {
        console.log("Sending sample data to Python ML backend...");

        const response = await fetch(ML_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                rainfall: sampleData.rainfall,
                soilMoisture: sampleData.soilMoisture,
                slope: sampleData.slope,
                elevation: sampleData.elevation,
                temperature: sampleData.temperature
            })
        });

        if (!response.ok) {
            throw new Error(`ML backend returned HTTP ${response.status}`);
        }

        const prediction = await response.json();

        if (prediction.status !== "success") {
            throw new Error(prediction.message || "ML prediction failed");
        }

        const dashboardData = {
            ...sampleData,
            risk: prediction.risk,
            riskScore: prediction.riskScore,
            probabilities: prediction.probabilities
        };

        console.log("ML prediction received:", prediction);

        await updateSensorData(dashboardData);

        updatePrediction({
            oneHour: "--",
            threeHour: "--",
            sixHour: "--"
        });

        setText(
            "predictionMessage",
            `ML model prediction: ${prediction.risk} (${prediction.riskScore}/100)`
        );

        console.log("ML backend connected successfully.");
        return prediction;

    } catch (error) {

        console.error("ML backend connection error:", error);

        setText(
            "predictionMessage",
            "ML backend unavailable. Start backend/app.py first."
        );

        return null;
    }
}


/* =====================================================
   AI PREDICTION
===================================================== */

/*
   REAL AI BACKEND CAN CALL:

   updatePrediction({

       oneHour: 65,
       threeHour: 72,
       sixHour: 81

   });

*/

function updatePrediction(
    prediction
) {

    setText(
        "pred1",
        prediction.oneHour ?? "--"
    );


    setText(
        "pred3",
        prediction.threeHour ?? "--"
    );


    setText(
        "pred6",
        prediction.sixHour ?? "--"
    );


    setText(
        "nowRisk",
        latestSensorData?.riskScore ?? "--"
    );


    setText(
        "time1",
        prediction.oneHour ?? "--"
    );


    setText(
        "time3",
        prediction.threeHour ?? "--"
    );


    setText(
        "time6",
        prediction.sixHour ?? "--"
    );


    setText(
        "predictionMessage",
        "AI prediction received from connected AI/ML service."
    );

}


/* =====================================================
   UTILITY
===================================================== */

function setText(
    id,
    text
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            text;

    }

}


function value(v) {

    return (
        v !== undefined &&
        v !== null
    )
        ? v
        : "--";

}


function normalize(
    v,
    min,
    max
) {

    v =
        Number(v);


    if (
        !Number.isFinite(v)
    ) {

        return 0;

    }


    return Math.max(

        0,

        Math.min(

            100,

            (
                (
                    v - min
                ) /
                (
                    max - min
                )
            ) *
            100

        )

    );

}


function updateBar(
    id,
    percentage
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.style.width =
            percentage + "%";

    }

}


/* =====================================================
   SAFE ROUTE BUTTON
===================================================== */

const findRouteButton =
    document.getElementById(
        "findRouteButton"
    );


if (findRouteButton) {

    findRouteButton.addEventListener(
        "click",
        findSafeRoute
    );

}


/* =====================================================
   INITIAL SYSTEM STATE + ML DEMO
===================================================== */

console.log(
    "NER-X loaded successfully."
);

console.log(
    "Prototype mode: connecting to Python ML backend..."
);

/*
   Start fixed sample-data prediction after page load.
   Backend must be running with: python app.py
*/
setTimeout(
    () => {
        runDemoPrediction();
    },
    1000
);

/*
   Manual demo option from browser console:
       runDemoPrediction();

   Later, replace this demo call with real sensor data
   and send it to updateSensorData().
*/
