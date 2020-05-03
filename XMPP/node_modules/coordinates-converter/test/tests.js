const Coordinate = require('../index.js');
const expect = require('chai').expect;


const expectedDd = [19.379306, -99.137472];
const expectedGeoJson = [-99.137472, 19.379306];

describe('Convert from DMS to DD', function () {

  describe('Parsing from string', function () {

    const expectedDms = Object.create(Coordinate.prototype, {
      latitude: {
        value: {
          degrees: 19,
          minutes: 22,
          seconds: 45.5,
          orientation: 'N'
        },
        enumerable: true
      },
      longitude: {
        value: {
          degrees: 99,
          minutes: 08,
          seconds: 14.9,
          orientation: 'W'
        },
        enumerable: true
      }
    });

    it('should parse string delimited by spaces', function () {
      const coordString = '19 22 45.5 N 99 08 14.9W';
      const parsedDms = new Coordinate(coordString);
      
      expect(parsedDms).to.deep.equal(expectedDms);
    });

    it('should parse string delimited by symbols', function () {
      const coordString = '19°22\'45.5"N 99°08\'14.9"W';
      const parsedDms = new Coordinate(coordString);
      
      expect(parsedDms).to.deep.equal(expectedDms);
    });
  });

  describe('Coordinates conversion', function () {

    it('should convert coords successfully to DD', function () {
      const coordString = '19 22 45.5 N 99 08 14.9W';
      const convertedDd = new Coordinate(coordString).toDd();

      expect(convertedDd).to.eql(expectedDd);
    });

    it('should convert coords successfully to GeoJSON', function () {
      const coordString = '19 22 45.5 N 99 08 14.9W';
      const convertedDd = new Coordinate(coordString).toDd();

      expect(convertedDd).to.eql(expectedDd);
    });
  })
});
