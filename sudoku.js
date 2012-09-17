/**
 *@ Sudoku
 *@ author: Zation
 */


var Sudoku = function(options) {
    var that = this;
    that.currentCol;
    that.currentLevel=that.levels['Easy'];

    that.endGrid = new Grid();
    that.endGrid.generate();
    that.beginGrid = new Grid();
    that.grid = new Grid();

    that.beginGrid.copy(that.endGrid);
    that.beginGrid.cull(that.currentLevel);
    that.grid.copy(that.beginGrid);
    var defaults = {
        boxId: 'sudoku'
    };
    that._options = $.extend(defaults, options);
    that.popUp = $('#popUp');
    that.load();
};

Sudoku.prototype = {
    levels:{
        'Easy':20,
        'Normal':30,
        'Hard':40
    },
    
    load: function() {
        var that = this;
        

        var mainDiv = document.getElementById(that._options.boxId);
        var mainTb = document.createElement('table');
        mainTb.setAttribute('id', 'mainTb');
        var mainRow;
        var mainCol;
        var subTb;
        var subRow;
        var subCol;
        for (var i = 0; i < 3; i++) {
            mainRow = document.createElement('tr');
            mainRow.className = 'mainRow';
            for (var j = 0; j < 3; j++) {
                mainCol = document.createElement('td');
                mainCol.className = 'mainCol';
                subTb = document.createElement('table');
                subTb.className = 'subTb';
                for (var k = 0; k < 3; k++) {
                    subRow = document.createElement('tr');
                    subRow.className = 'subRow';
                    for (var l = 0; l < 3; l++) {
                        subCol = document.createElement('td');
                        subCol.setAttribute('id', (i * 3 + k) + '-' + (j * 3 + l));
                        subCol.className = 'subCol';
                        subRow.appendChild(subCol);
                    }
                    subTb.appendChild(subRow);
                }
                mainCol.appendChild(subTb);
                mainRow.appendChild(mainCol);
            }
            mainTb.appendChild(mainRow);
        }
        mainDiv.appendChild(mainTb);

        that.start();

        $('#popUp td.popCol').click(function() {
            if ($(this).hasClass('popCan')) {
                var colValue = this.innerHTML;
                var coordin = that.currentCol.getAttribute('id');
                that.currentCol.innerHTML = colValue;
                that.grid.setValue(Number(coordin.split('-')[1]), Number(coordin.split('-')[0]), Number(colValue));
                $('#popUp').fadeOut(500);
            }
        })
        $('#popUp td#popUpClose').click(function() {
            $('#popUp').fadeOut(500);
        })
        $('#popUp td#popUpClear').click(function() {
            that.currentCol.innerHTML = '';
            var coordin = that.currentCol.getAttribute('id');
            that.grid.setValue(Number(coordin.split('-')[1]), Number(coordin.split('-')[0]), 0);
            $('#popUp').fadeOut(500);
        })
        
        $('#new').click(function(){
            that.new(that.currentLevel);
            that.info('Start a new game.');
            
        })

        $('#restart').click(function() {
            that.grid.copy(that.beginGrid);
            $('.empty').each(function(index) {
                this.innerHTML = '';
            })
            that.info('Clear all data.')
        })

        $('#solve').click(function() {
            that.solve();
            that.info('Show the result.')
        })
        
        $('#level').click(function(){
            $('#levels').css('left',$('#level').offset().left+'px');
            $('#levels').slideToggle(500);
        })
        
        $('#levels li').click(function(){
            $('#levels li').removeClass('select');
            $(this).addClass('select');
            $('#levels').slideUp(500);
            that.currentLevel=that.levels[$(this).html()];
            that.new(that.currentLevel);
            that.info('Change level to '+$(this).html());
        })
    },
    
    info: function(infoStr){
        $('#info').html(infoStr);
        $('#info').stop(true, true);
        $('#info').hide();
        $('#info').fadeIn(100);
        $('#info').fadeOut(3000);
    },
    
    new: function(level){
        this.endGrid = new Grid();
        this.endGrid.generate();
        this.beginGrid = new Grid();
        this.grid = new Grid();
    
        this.beginGrid.copy(this.endGrid);
        this.beginGrid.cull(level);
        this.grid.copy(this.beginGrid);
        
        $('#mainTb td.subCol').each(function(index){
            this.className='subCol';
            $(this).unbind();
        })
        
        this.start();
    },

    start: function() {
        var that = this;
        var colVal;
        var colElem;
        for (var row = 0; row < 9; row++) {
            for (var col = 0; col < 9; col++) {
                colVal = that.beginGrid.rows[row][col];
                colElem = document.getElementById(row + '-' + col);
                colElem.innerHTML = '';
                if (colVal != 0) {
                    colElem.className += ' cDefault';
                    colElem.innerHTML = colVal;
                } else that.colEvent(colElem, row, col);
            }
        }
    },

    solve: function() {
        var that = this;
        var colVal;
        var colElem;
        for (var row = 0; row < 9; row++) {
            for (var col = 0; col < 9; col++) {
                colVal = that.endGrid.rows[row][col];
                colElem = document.getElementById(row + '-' + col);
                colElem.innerHTML = colVal;
            }
        }
    },

    colEvent: function(elem, rowId, colId) {
        var that = this;
        var restore = [];
        var highLightElem;
        $(elem).addClass('empty');
        $(elem).hover(function() {
            for (var i = 0; i < 9; i++) {
                highLightElem = $('#' + rowId + '-' + i);
                restore.push(highLightElem);
                highLightElem.addClass('highLight');
            }
            for (var i = 0; i < 9; i++) {
                highLightElem = $('#' + i + '-' + colId);
                restore.push(highLightElem);
                highLightElem.addClass('highLight');
            }
        }, function() {
            $.each(restore, function(index, value) {
                value.removeClass('highLight');
            })
        });
        $(elem).click(function() {
            var thisPosi = $(this).position();
            that.popUp.hide();
            for (var i = 1; i < 10; i++) {
                if (that.grid.cellConflicts(colId, rowId, i)) {
                    document.getElementById('popUp' + i).className = 'popCant';
                } else {
                    document.getElementById('popUp' + i).className = 'popCan';
                }
            }
            that.popUp.css('top', thisPosi.top - 6);
            that.popUp.css('left', thisPosi.left - 6);
            that.currentCol = this;
            that.popUp.fadeIn(500);
        });
    }
}