/* global $, Q, _, jsPDF */
'use strict';

/*
var model = {
    teams: [
        {
            teamName: "ABC",
            players: [
                { playerName: "A", dcinum: "601", tableNumber: 1 },
                { playerName: "B", dcinum: "602", tableNumber: 1 },
                { playerName: "C", dcinum: "603", tableNumber: 2 }
            ]
        }
    ]
};
*/

/*
var model = (function () {
    var model = { players: [], teams: [] };
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"; // NOT SUPPORTED: ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩȘ
    var tableNumber = 0;
    var playerNumber = 0;
    var team;
    while (letters.length >= 3) {
        var teamName = letters.substr(0, 3);
        letters = letters.substr(3);
        var players = $.map(teamName.split(''), function (letter) {
            playerNumber += 1;
            if (playerNumber % 2 === 1) tableNumber += 1;
            return {
                playerName: letter,
                dcinum: (600 + playerNumber).toString(),
                tableNumber: tableNumber
            }
        });
        model.teams.push({
            teamName: teamName,
            players: players
        });
    }

    return model;
}());
*/

var model = { players: [], teams: [] };

function fitString(s, l) {
    if (typeof l === 'undefined') l = 18;
    if (typeof s !== 'string') return s;
    return s.substr(0, l);
}

function lpad(s, p, l) {
    if (typeof s !== 'string') return s;
    while (s.length < l) s = p + s;
    return s;
}

function pageDistribution(count, countPerPage, groupBy) {
    groupBy = groupBy || 1;
    var pageCount = Math.ceil(count/countPerPage);
    var rowsPerPage = Math.ceil(count/pageCount);
    var cuttingMachineOrder = [];
    var i, j;
    for (i = 0; i < pageCount; i++) {
        cuttingMachineOrder.push([]);
    }
    for (i = 0; i < count; ) {
        for (j = 0; i < count && j < groupBy; i++, j++) {
            cuttingMachineOrder[(i-j)/groupBy % pageCount].push(i);
        }
    }
    return cuttingMachineOrder;
}

jsPDF.API.teamRegistering = function teamRegistering(team, config) {
    _.extend({
        x: 10,
        y: 10,
        width: 40,
        height: 20,
        cornerRadius: 1.5
    }, config);

    this.roundedRect(config.x, config.y, config.width, config.height, config.cornerRadius, config.cornerRadius);
    var offset = 5;
    this.roundedRect(config.x, config.y+offset, config.width, config.height-offset, config.cornerRadius, config.cornerRadius);
    this.setFont('helvetica', 'bold');
    this.setFontSize(10);
    this.text(config.x + 1, config.y + 4, 'TEAM REGISTERING');
    this.setFont('courier', 'normal');
    this.setFontSize(12);
    this.text(config.x + 1, config.y + 9, fitString(team.teamName, 17));
};

jsPDF.API.teamPlaying = function teamPlaying(team, player, config) {
    $.extend({
        x: 10,
        y: 10,
        width: 40,
        height: 20,
        cornerRadius: 1.5
    }, config);

    var playerName = player.playerName.split(/, /, 2);

    this.roundedRect(config.x, config.y, config.width, config.height, config.cornerRadius, config.cornerRadius);
    var offset = 5;
    this.roundedRect(config.x, config.y, config.width-offset, config.height-offset, config.cornerRadius, config.cornerRadius);
    this.setFont('helvetica', 'normal');
    this.setFontSize(10);
    this.text(config.x + 1, config.y + config.height-1, 'PLAYER USING DECK');
    this.setFont('helvetica', 'bold');
    this.setFontSize(12);
    this.text(config.x + config.width-1, config.y + config.height/2, lpad('' + player.tableNumber, '0', 3), 90);
    this.setFont('courier', 'normal');
    this.setFontSize(12);
    this.text(config.x + 1, config.y + 4, fitString(team.teamName, 15));
    this.setFontSize(10);
    this.setFont('courier', 'bold');
    this.text(config.x + 1, config.y + 11, fitString(playerName[0]) + '\n' + fitString(playerName[1]) + '\n' + player.dcinum);
};

jsPDF.API.horizontalCutMarks = function horizontalCutMarks(y) {
    var w = 15, n = 3;
    var ww = w/(n*2-1);
    for (var i = 0; i < n; i++) {
        this.lines([[ww, 0]], ww*i*2, y);
        this.lines([[ww, 0]], 210-w+ww*i*2, y);
    }
};

jsPDF.API.header = function header(text) {
    this.setFont('helvetica', 'bold');
    this.setFontSize(12);
    this.text(80, 20, text);
};

jsPDF.API.team = function team(team, config) {
    $.extend({
        x: 10,
        y: 10,
        width: 100,
        height: 40
    }, config);
    this.setFont('helvetica', 'normal');
    this.setFontSize(10);
    // this.rect(config.x, config.y, config.width, config.height);
    this.text(config.x +  1, config.y + 6, lpad('' + team.players[0].tableNumber, '0', 3));
    this.setFontStyle('bold');
    this.text(config.x + 11, config.y + 6, fitString(team.teamName, 30));
    this.setFontStyle('normal');
    _.each(team.players, function (player, k) {
        this.text(config.x + 21, config.y + 6+(k+1)*5, fitString(player.playerName, 30));
    }, this);
};

function renderMasterList(model, pageLimit) {
    var doc = new jsPDF();
    var $renderHelper = $('<div class="render-helper-master-list"></div>');
    var topMargin = 27, leftMargin = 10;
    var w = 100, h = 25;
    var itemsPerColumn = Math.floor((297-topMargin-leftMargin)/h), columnsPerPage = 2;
    var x, y, kp;
    var page = 0;
    var pageCount = Math.ceil(model.teams.length / (itemsPerColumn * columnsPerPage));
    _(model.teams).chain()
        .sortBy('teamName')
        .each(function (team, k) {
            if (page >= pageLimit) return false;
            kp = k % (itemsPerColumn * columnsPerPage);
            if (kp === 0) {
                page++;
                if (page > pageLimit) return false;
                if (k) {
                    doc.addPage();
                }
                doc.header('Master List (' + page + ' of ' + pageCount +')');
            }
            x = Math.floor(kp/itemsPerColumn) * w;
            y = (kp % itemsPerColumn) * h;

            doc.team(team, {
                x: x + leftMargin,
                y: y + topMargin,
                width: w,
                height: h
            });
        });
    return doc;
}

function renderLabels(model, pageLimit) {
    var doc = new jsPDF();
    var paperSettings = {
            width: 45.7,
            height: 25.5,
            labelAcross: 4,
            labelAround: 10,
            topMargin: 21,
            bottomMargin: 21,
            leftMargin: 10.6,
            rightMargin: 10.6,
            gapAround: 0,
            gapAcross: 2,
            cornerRadius: 1.5
        };

    var cutmarkGroups = 2;

    var forLayout = _.chain(pageDistribution(model.teams.length, paperSettings.labelAround, cutmarkGroups))
        .map(function (page) {
            return _.chain(page)
                .map(function (pos) {
                    return model.teams[pos];
                })
                .map(function (team) {
                    var set = [];
                    set.push([ 'teamRegistering', team ]);

                    _.each(team.players, function (player) {
                        set.push([ 'teamPlaying', team, player ]);
                    });
                    return set;
                })
                .flatten(true)
                .value();
        })
        .value();

    if (typeof pageLimit !== 'undefined') {
        forLayout = forLayout.slice(0, pageLimit);
    }

    var cutmarksIterator = _.range(paperSettings.labelAround/cutmarkGroups + 1);

    var x = 0, y = 0;
    _.each(forLayout, function (page, pk) {
        _.each(page, function (item, k) {
            x += paperSettings.width + paperSettings.gapAcross;
            if (k % paperSettings.labelAcross === 0) {
                x = paperSettings.leftMargin;
                y += paperSettings.height + paperSettings.gapAround;
            }
            if (k === 0) {
                if (pk) {
                    doc.addPage();
                }
                x = paperSettings.leftMargin;
                y = paperSettings.topMargin;
            }

            var methodName = item.shift();
            item.push($.extend({}, paperSettings, { x: x, y: y }));
            doc[methodName].apply(doc, item);
        });

        _.each(cutmarksIterator, function (y) {
            doc.horizontalCutMarks(y * (paperSettings.height + paperSettings.gapAround) * cutmarkGroups + paperSettings.topMargin);
        });
    });

    return doc;
}

function updatePreview() {
    var doc;
    if ($('input[name="preview-type"][value="master-list"]').get(0).checked) {
        doc = renderMasterList(model, 2);
    }
    else {
        doc = renderLabels(model, 2);
    }
    $('.preview-pane').attr('src', doc.output('datauristring'));
}

function openFile() {
    var input = $('.system input[type=file]');
    input.off('change');

    var deferred = Q.defer();
    var filename;

    var fr = new FileReader();
    fr.onload = function (e) {
        deferred.resolve(e.target.result, filename);
    };

    // MAYBE: Reject promise?

    input.one('change', function () {
        if (input[0].files.length > 0) {
            filename = input[0].files[0].name;
            fr.readAsText(input[0].files[0]);
        }
    });
    input[0].click();

    return deferred.promise;
}

function parsePlayersFile(contents, filename) {
    if (filename && !filename.match(/302\.txt$/)) {
        // TODO: Emit warning for filename mistmatch
        console.warn('You might be using an unrecognized players file!');
    }
    var players = _.chain(contents.split(/\n/))
        .map(function (line) {
            if (line.match(/^\s*$/)) return; // skip empty lines
            return line.split(/\t/);
        })
        .compact()
        .map(function (line) {
            return {
                playerId: line[0],
                playerName: line[6],
                dcinum: line[8]
            };
        })
        .value();

    model.players = players;
    return players;
}

function clearPlayers() {
    model.players = [];
    model.teams = [];
}

function parseTeamsFile(contents, filename) {
    if (filename && !filename.match(/307\.txt$/)) {
        // TODO: Emit warning for filename mistmatch
        console.warn('You might be using an unrecognized teams file!');
    }
    // TODO: Inherit seating information; table numbers autogenerated
    var tableNumber = 0;
    var teams = _.chain(contents.split(/\n/))
        .map(function (line) {
            if (line.match(/^\s*$/)) return; // skip empty lines
            return line.split(/\t/);
        })
        .compact()
        .map(function (line) {
            return {
                teamName: line[4],
                players: [
                    line[14],
                    line[15],
                    line[16]
                ]
            };
        })
        .map(function (team) {
            team.players = _(team.players)
                .map(function (playerId) {
                    tableNumber += 0.5;
                    return _.extend({}, _.findWhere(model.players, { playerId: playerId }), {
                        tableNumber: Math.ceil(tableNumber)
                    });
                });
            return team;
        })
        .value();

    model.teams = teams;
    return teams;
}

function parseWERFile(contents, filename) {
    var xmlDoc = $.parseXML(contents);
    var $xml = $(xmlDoc);

    var tableNumber = 0;
    var allPlayers = [];
    var teams = _.chain($xml.find('team').toArray())
        .map(function (teamEl) {
            return {
                teamName: $(teamEl).attr('name'),
                players: $(teamEl).find('member').toArray()
            };
        })
        .map(function (team) {
            team.players = _(team.players)
                .map(function (memberEl) {
                    var $person = $xml.find('person[id="' + $(memberEl).attr('person') + '"]');

                    tableNumber += 0.5;
                    var player = {
                        playerId: $person.attr('id'),
                        playerName: $person.attr('last') + ', ' + $person.attr('first'),
                        dcinum: $person.attr('id'),
                        tableNumber: Math.ceil(tableNumber)
                    };
                    allPlayers.push(player);

                    return player;
                });
            return team;
        })
        .value();

    // Honoring seat information, if available
    _($xml.find('seats seat').toArray())
        .map(function (seatEl) {
            var playerId = $(seatEl).attr('player');
            var tableNumber = $(seatEl).closest('table').attr('number');
            var player = _(allPlayers).findWhere({ playerId: playerId });
            player.tableNumber = parseInt(tableNumber);
        });

    model.players = allPlayers;
    model.teams = teams;
    return teams;
}

function clearTeams() {
    model.teams = [];
}

function updateView() {
    $('.p-players-list-empty').toggle(model.players.length === 0);
    $('.p-players-list-loaded').toggle(model.players.length > 0);
    $('.player-count').text(model.players.length);
    $('.p-teams-list-empty').toggle(model.players.length > 0 && model.teams.length === 0);
    $('.p-teams-list-loaded').toggle(model.players.length > 0 && model.teams.length > 0);
    $('.team-count').text(model.teams.length);
}
updateView();

$(document).on('click', '.action-load-wer-file', function (event) {
    event.preventDefault();
    openFile()
        .then(parseWERFile)
        .then(updatePreview)
        .then(updateView)
        .done();
});

$(document).on('click', '.action-load-players', function (event) {
    event.preventDefault();
    openFile()
        .then(parsePlayersFile)
        .then(updatePreview)
        .then(updateView)
        .done();
});

$(document).on('click', '.action-clear-players', function (event) {
    event.preventDefault();
    clearPlayers();
    updatePreview();
    updateView();
});

$(document).on('click', '.action-load-teams', function (event) {
    event.preventDefault();
    openFile()
        .then(parseTeamsFile)
        .then(updatePreview)
        .then(updateView)
        .done();
    updateView();
});

$(document).on('click', '.action-clear-teams', function (event) {
    event.preventDefault();
    clearTeams();
    updatePreview();
    updateView();
});

$(document).on('click', '.action-refresh', function (event) {
    updatePreview();
});

$(document).on('change', '.onchange-refresh', function (event) {
    updatePreview();
});

$(document).on('click', '.action-download-master-list', function (event) {
    event.preventDefault();
    var doc = renderMasterList(model);
    doc.save('master-list.pdf');
});

$(document).on('click', '.action-download-labels', function (event) {
    event.preventDefault();
    var doc = renderLabels(model);
    doc.save('labels.pdf');
});

$(document).on('click', '.action-toggle-fullscreen', function (event) {
    event.preventDefault();
    $('body').toggleClass('preview-pane-fullscreen');
});


