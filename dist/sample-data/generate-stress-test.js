var fs = require('fs');
var _ = require('underscore');

var sourcePrefix = 'dciv3-team-12/TXBB';
var targetPrefix = 'stress-test/ZXZZ';
var playersFilename = '302.dat';
var teamsFilename = '307.dat';
var pairingsFilename = '315.txt';
var multiplier = 5;
var kcols = [4, 5, 6, 8];


function tsv2array(tsv) {
  return _(tsv.split(/\n/))
    .chain()
    .map(function (line) {
      if (line.match(/^\s*$/)) return;
      return line.split(/\t/);
    })
    .compact()
    .value();
}

function array2tsv(array) {
  return _(array).map(function (line) {
      return line.join('\t');
    }).join('\n');
}

function process(fromFilename, toFilename, callback) {
  fs.readFile(fromFilename, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }

    var output = array2tsv(callback(tsv2array(data)));

    fs.writeFile(toFilename, output, function (err) {
      if (err) return console.log(err);

      console.log('Done.');
    });
  });
}

process(sourcePrefix + playersFilename, targetPrefix + playersFilename, function (originalPlayers) {
  return _.chain(multiplier)
    .range()
    .collect(function (k) {
      return _(originalPlayers).map(function (player) {
        var newPlayer = player.slice();
        newPlayer[0] = parseInt(newPlayer[0]) + k * originalPlayers.length;
        _(kcols).each(function (kcol) {
          newPlayer[kcol] = newPlayer[kcol] + '-' + (k+1);
        });
        return newPlayer;
      })
    })
    .flatten(true);
});

process(sourcePrefix + teamsFilename, targetPrefix + teamsFilename, function (originalTeams) {
  return _.chain(multiplier)
    .range()
    .collect(function (k) {
      return _(originalTeams).map(function (team) {
        var newTeam = team.slice();
        newTeam[4] = (k+1) + '-' + newTeam[4];
        newTeam[14] = parseInt(newTeam[14]) + k * originalTeams.length * 3;
        newTeam[15] = parseInt(newTeam[15]) + k * originalTeams.length * 3;
        newTeam[16] = parseInt(newTeam[16]) + k * originalTeams.length * 3;
        return newTeam;
      })
    })
    .flatten(true);
});
