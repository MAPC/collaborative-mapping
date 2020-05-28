# Collaborative Mapping with Mapbox

This is a simple collaborative mapping application using [Mapbox GL JS](https://github.com/mapbox/mapbox-gl-js) and [Mapbox GL Draw](https://github.com/mapbox/mapbox-gl-draw). In its current version, the basemap choropleths and map features are focused around [MAPC's West Station Area Transit Study](https://www.mapc.org/resource-library/west-station-area-transit-study/). A breakdown of the basemap options is as follows:

## Map features
- **Focus area and buffer:** West Station area study focus area and surrounding area
- **MBTA and ferry lines/stops:** All commuter rail, subway, trolley, ferry, and bus lines in the MBTA system, plus other major ferry lines and stops in the region.
- **MassBuilds developments:** Data from [MassBuilds](https://www.massbuilds.com/) that were not cancelled and have a completion year of 2010 or later

## Demographic choropleths
CTPS Long-Range Transit Plan data (base year 2016), by transit area zone (TAZ). Choropleths cover Massachusetts, Rhode Island, and southeast New Hampshire.

## 2040 projection choropleths
Employment and household number projections for 2040 according to three different model scenarios, by census block. Approximately matches up with focus area buffer and covers parts of Arlington, Belmont, Boston, Brookline, Cambridge, Medford, Newton, and Watertown.

## Average trips to focus area
Modelled shares of trips from a particular TAZ to the focus area on a given weekday morning. Total trips, transit trips, and both auto trips as a driver and as a passenger cover TAZs in much of eastern Massachusetts; bike trips and walking trips cover the focus area and buffer zone.