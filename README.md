 # QuoL-i Thessaloniki

### Urban Quality of Life Assessment through Earth Observation, GIS and Interactive WebGIS

## 1. Project Overview

QuoL-i Thessaloniki is a geospatial research project developed as an undergraduate thesis in Surveying and Geoinformatics Engineering.

The project focuses on the development of a composite Quality of Life (QoL) index for Metropolitan Thessaloniki, Greece, integrating socioeconomic, environmental and accessibility indicators.

The results are presented through an interactive WebGIS application, enabling users to explore spatial patterns and investigate alternative indicator weighting scenarios.

[Explore the WebGIS Application](https://repository-name-quol-i-thessaloniki.vercel.app/)

## 2. Research Objectives

- Develop a composite urban Quality of Life index.
- Integrate heterogeneous geospatial and socioeconomic datasets.
- Extract environmental indicators from satellite imagery.
- Assess spatial accessibility to essential urban services.
- Apply multi-criteria decision analysis.
- Investigate the sensitivity of the composite index to weighting variations.
- Explore spatial autocorrelation.
- Develop an interactive WebGIS application for spatial visualization.

## 3. Study Area

| Parameter | Description |
|---|---|
| Study area | Metropolitan Thessaloniki, Greece |
| Spatial units | 15 Municipal Communities |
| Reference year | 2021 |
| Coordinate reference system | EPSG:2100 |
| Total indicators | 17 |

## 4. Data Sources

- Sentinel-2 multispectral satellite imagery
- Landsat-8 thermal satellite imagery
- Population census and socioeconomic data
- Urban facilities and services
- Administrative boundaries
- Urban block spatial data

## 5. Quality of Life Assessment Framework

The composite index integrates 17 indicators organized into three thematic dimensions.

### Socioeconomic Dimension (4 indicators)

- Dependency ratio
- Tertiary education
- Labour force participation
- Unemployment

### Environmental Dimension (3 indicators)

- Normalized Difference Vegetation Index (NDVI)
- Normalized Difference Built-up Index (NDBI)
- Land Surface Temperature (LST)

### Accessibility Dimension (10 indicators)

- Sports facilities
- Primary schools
- Lower secondary schools
- Upper secondary schools
- Hospitals
- Pharmacies
- Supermarkets
- Metro stations
- Playgrounds
- Kindergartens

## 6. Earth Observation and Remote Sensing

Satellite-derived environmental indicators were used to characterize urban environmental conditions.

| Indicator | Satellite | Application |
|---|---|---|
| NDVI | Sentinel-2 | Vegetation assessment |
| NDBI | Sentinel-2 | Built-up area assessment |
| LST | Landsat-8 | Urban surface temperature assessment |

### NDVI

Normalized Difference Vegetation Index:

$$
NDVI = \frac{NIR-Red}{NIR+Red}
$$

### NDBI

Normalized Difference Built-up Index:

$$
NDBI = \frac{SWIR-NIR}{SWIR+NIR}
$$

### LST

Land Surface Temperature was derived from Landsat-8 Level-2 products to characterize urban thermal conditions.

## 7. Multi-Criteria Decision Analysis

The methodological framework incorporates the Analytic Hierarchy Process (AHP), indicator normalization and weighted aggregation.

The weighting scenario implemented in the composite index is:

| Dimension | Weight |
|---|---:|
| Socioeconomic | 41.26% |
| Environmental | 32.75% |
| Accessibility | 25.99% |

$$
QoL_i = 0.4126S_i + 0.3275E_i + 0.2599A_i
$$

Where:

- S represents the socioeconomic dimension.
- E represents the environmental dimension.
- A represents the accessibility dimension.

## 8. Sensitivity Analysis

Sensitivity analysis was performed to investigate the robustness of the composite index under alternative weighting scenarios.

The evaluation included:

- Weight perturbations of ±20%.
- Spearman rank correlation.
- Mean ranking changes.
- Maximum ranking changes.

The results indicated relatively stable rankings across the tested weighting scenarios.

## 9. Spatial Statistics

Global Moran's I was applied to investigate spatial autocorrelation in the composite Quality of Life index.

The analysis indicated weak positive spatial autocorrelation, without statistical significance at the 5% significance level.

## 10. WebGIS Application

The interactive application supports:

- Choropleth mapping
- Interactive spatial visualization
- Custom indicator weighting
- AHP-based weighting scenarios
- Dynamic legends
- Histograms
- Cumulative distribution visualization
- Radar charts
- Comparative analysis of municipal communities

## 11. System Architecture

### Current Deployment: Static WebGIS Architecture

The deployed version of QuoL-i Thessaloniki follows a client-side WebGIS architecture.

Preprocessed geospatial data and normalized indicators are stored in a static GeoJSON file containing the geometries and attributes of 15 municipal communities.

The application loads the GeoJSON dataset directly in the browser and dynamically recalculates the composite Quality of Life index whenever the user modifies the indicator weights.

The deployed application does not require an active backend server or database connection for loading the QoL dataset or calculating the composite index.

```mermaid
flowchart TD
    A[Satellite Imagery] --> D[Geospatial Data Processing]
    B[Socioeconomic Data] --> D
    C[Urban Accessibility Data] --> D
    D --> E[Indicator Calculation]
    E --> F[Normalization and MCDA]
    F --> G[Static GeoJSON Dataset]
    G --> H[Client-side Data Loading]
    H --> I[Dynamic QoL Calculation]
    I --> J[React Application]
    J --> K[MapLibre GL JS]
    J --> L[Chart.js]
    K --> M[Interactive WebGIS]
    L --> M
```

### Data Flow

1. Load the static GeoJSON dataset.
2. Retrieve municipal community geometries and normalized indicators.
3. Recalculate composite QoL scores using the selected weights.
4. Update the thematic map and statistical visualizations.
5. Enable interactive exploration and comparison of spatial patterns.

### Original Development Architecture

During the initial development phase, the project implemented a client-server architecture using Python, FastAPI, PostgreSQL and PostGIS.

For the final public deployment, the application was adapted to a static GeoJSON-based architecture to simplify hosting and eliminate the need for an active backend and database connection.

The earlier backend implementation is preserved in the [legacy-backend branch](../../tree/legacy-backend) for reference.

## 12. Technology Stack

### Frontend

- React
- Vite
- JavaScript
- MapLibre GL JS
- Chart.js
- HTML
- CSS

### Geospatial Data and Processing

- GeoJSON
- Client-side geospatial data loading
- Dynamic weighted aggregation
- Thematic mapping
- Interactive statistical visualization

### Scientific Methods

- Geographic Information Systems (GIS)
- Earth Observation (EO)
- Remote Sensing (RS)
- Spatial Analysis
- Spatial Statistics
- Multi-Criteria Decision Analysis (MCDA)
- Analytic Hierarchy Process (AHP)

### Original Backend Architecture (Archived)

- Python
- FastAPI
- PostgreSQL
- PostGIS

### Version Control and Deployment

- Git
- GitHub
- Vercel




## 14. Future Research

Potential extensions include:

- Alternative normalization methods.
- Distance-decay accessibility modelling.
- Integration of additional Earth Observation datasets.
- Spatiotemporal Quality of Life assessment.
- Investigation of machine learning approaches for geospatial modelling.

## 15. Author

**Nick Chatzis**

Undergraduate Thesis — 2026

Surveying and Geoinformatics Engineering

International Hellenic University
