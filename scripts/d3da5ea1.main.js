"use strict";function fitString(a,b){return"undefined"==typeof b&&(b=18),"string"!=typeof a?a:a.substr(0,b)}function lpad(a,b,c){if("string"!=typeof a)return a;for(;a.length<c;)a=b+a;return a}function pageDistribution(a,b,c){c=c||1;var d,e,f=Math.ceil(a/b),g=(Math.ceil(a/f),[]);for(d=0;f>d;d++)g.push([]);for(d=0;a>d;)for(e=0;a>d&&c>e;d++,e++)g[(d-e)/c%f].push(d);return g}function renderMasterList(a,b){var c,d,e,f=new jsPDF,g=($('<div class="render-helper-master-list"></div>'),27),h=10,i=100,j=25,k=Math.floor((297-g-h)/j),l=2,m=0,n=Math.ceil(a.teams.length/(k*l));return _(a.teams).chain().sortBy("teamName").each(function(a,o){if(m>=b)return!1;if(e=o%(k*l),0===e){if(m++,m>b)return!1;o&&f.addPage(),f.header("Master List ("+m+" of "+n+")")}c=Math.floor(e/k)*i,d=e%k*j,f.team(a,{x:c+h,y:d+g,width:i,height:j})}),f}function renderLabels(a,b){var c=new jsPDF,d={width:45.7,height:25.5,labelAcross:4,labelAround:10,topMargin:21,bottomMargin:21,leftMargin:10.6,rightMargin:10.6,gapAround:0,gapAcross:2,cornerRadius:1.5},e=2,f=_.chain(pageDistribution(a.teams.length,d.labelAround,e)).map(function(b){return _.chain(b).map(function(b){return a.teams[b]}).map(function(a){var b=[];return b.push(["teamRegistering",a]),_.each(a.players,function(c){b.push(["teamPlaying",a,c])}),b}).flatten(!0).value()}).value();"undefined"!=typeof b&&(f=f.slice(0,b));var g=_.range(d.labelAround/e+1),h=0,i=0;return _.each(f,function(a,b){_.each(a,function(a,e){h+=d.width+d.gapAcross,e%d.labelAcross===0&&(h=d.leftMargin,i+=d.height+d.gapAround),0===e&&(b&&c.addPage(),h=d.leftMargin,i=d.topMargin);var f=a.shift();a.push($.extend({},d,{x:h,y:i})),c[f].apply(c,a)}),_.each(g,function(a){c.horizontalCutMarks(a*(d.height+d.gapAround)*e+d.topMargin)})}),c}function updatePreview(){var a;a=$('input[name="preview-type"][value="master-list"]').get(0).checked?renderMasterList(model,2):renderLabels(model,2),$(".preview-pane").attr("src",a.output("datauristring"))}function openFile(){var a=$(".system input[type=file]");a.off("change");var b,c=Q.defer(),d=new FileReader;return d.onload=function(a){c.resolve(a.target.result,b)},a.one("change",function(){a[0].files.length>0&&(b=a[0].files[0].name,d.readAsText(a[0].files[0]))}),a[0].click(),c.promise}function parsePlayersFile(a,b){b&&!b.match(/302\.txt$/)&&console.warn("You might be using an unrecognized players file!");var c=_.chain(a.split(/\n/)).map(function(a){return a.match(/^\s*$/)?void 0:a.split(/\t/)}).compact().map(function(a){return{playerId:a[0],playerName:a[6],dcinum:a[8]}}).value();return model.players=c,c}function clearPlayers(){model.players=[],model.teams=[]}function parseTeamsFile(a,b){b&&!b.match(/307\.txt$/)&&console.warn("You might be using an unrecognized teams file!");var c=0,d=_.chain(a.split(/\n/)).map(function(a){return a.match(/^\s*$/)?void 0:a.split(/\t/)}).compact().map(function(a){return{teamId:a[0],teamName:a[4],players:[a[14],a[15],a[16]]}}).map(function(a){return a.players=_(a.players).map(function(a){return c+=.5,_.extend({},_.findWhere(model.players,{playerId:a}),{tableNumber:Math.ceil(c)})}),a}).value();return model.teams=d,d}function clearTeams(){model.teams=[]}function updateView(){$(".p-players-list-empty").toggle(0===model.players.length),$(".p-players-list-loaded").toggle(model.players.length>0),$(".player-count").text(model.players.length),$(".p-teams-list-empty").toggle(model.players.length>0&&0===model.teams.length),$(".p-teams-list-loaded").toggle(model.players.length>0&&model.teams.length>0),$(".team-count").text(model.teams.length)}var model={players:[],teams:[]};jsPDF.API.teamRegistering=function(a,b){_.extend({x:10,y:10,width:40,height:20,cornerRadius:1.5},b),this.roundedRect(b.x,b.y,b.width,b.height,b.cornerRadius,b.cornerRadius);var c=5;this.roundedRect(b.x,b.y+c,b.width,b.height-c,b.cornerRadius,b.cornerRadius),this.setFont("helvetica","bold"),this.setFontSize(10),this.text(b.x+1,b.y+4,"TEAM REGISTERING"),this.setFont("courier","normal"),this.setFontSize(12),this.text(b.x+1,b.y+9,fitString(a.teamName,17))},jsPDF.API.teamPlaying=function(a,b,c){$.extend({x:10,y:10,width:40,height:20,cornerRadius:1.5},c);var d=b.playerName.split(/, /,2);this.roundedRect(c.x,c.y,c.width,c.height,c.cornerRadius,c.cornerRadius);var e=5;this.roundedRect(c.x,c.y,c.width-e,c.height-e,c.cornerRadius,c.cornerRadius),this.setFont("helvetica","normal"),this.setFontSize(10),this.text(c.x+1,c.y+c.height-1,"PLAYER USING DECK"),this.setFont("helvetica","bold"),this.setFontSize(12),this.text(c.x+c.width-1,c.y+c.height/2,lpad(""+b.tableNumber,"0",3),90),this.setFont("courier","normal"),this.setFontSize(12),this.text(c.x+1,c.y+4,fitString(a.teamName,15)),this.setFontSize(10),this.setFont("courier","bold"),this.text(c.x+1,c.y+11,fitString(d[0])+"\n"+fitString(d[1])+"\n"+b.dcinum)},jsPDF.API.horizontalCutMarks=function(a){for(var b=15,c=3,d=b/(2*c-1),e=0;c>e;e++)this.lines([[d,0]],d*e*2,a),this.lines([[d,0]],210-b+d*e*2,a)},jsPDF.API.header=function(a){this.setFont("helvetica","bold"),this.setFontSize(12),this.text(80,20,a)},jsPDF.API.team=function a(a,b){$.extend({x:10,y:10,width:100,height:40},b),this.setFont("helvetica","normal"),this.setFontSize(10),this.text(b.x+1,b.y+6,lpad(""+a.players[0].tableNumber,"0",3)),this.setFontStyle("bold"),this.text(b.x+11,b.y+6,fitString(a.teamName,30)),this.setFontStyle("normal"),_.each(a.players,function(a,c){this.text(b.x+21,b.y+6+5*(c+1),fitString(a.playerName,30))},this)},updateView(),$(document).on("click",".action-load-players",function(a){a.preventDefault(),openFile().then(parsePlayersFile).then(updatePreview).then(updateView).done()}),$(document).on("click",".action-clear-players",function(a){a.preventDefault(),clearPlayers(),updatePreview(),updateView()}),$(document).on("click",".action-load-teams",function(a){a.preventDefault(),openFile().then(parseTeamsFile).then(updatePreview).then(updateView).done(),updateView()}),$(document).on("click",".action-clear-teams",function(a){a.preventDefault(),clearTeams(),updatePreview(),updateView()}),$(document).on("click",".action-refresh",function(a){updatePreview()}),$(document).on("change",".onchange-refresh",function(a){updatePreview()}),$(document).on("click",".action-download-master-list",function(a){a.preventDefault();var b=renderMasterList(model);b.save("master-list.pdf")}),$(document).on("click",".action-download-labels",function(a){a.preventDefault();var b=renderLabels(model);b.save("labels.pdf")}),$(document).on("click",".action-toggle-fullscreen",function(a){a.preventDefault(),$("body").toggleClass("preview-pane-fullscreen")});