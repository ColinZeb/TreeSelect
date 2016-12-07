
+function () {
    var isString = function (str) {
        return typeof str === "string" || str instanceof String;
    };
    //改变成员名称
    Array.prototype.changeItemMemberName = function (ok, nk) {
        if (isString(ok) && isString(nk) && ok !== nk) {
            for (var i in this) {
                var item = this[i];
                if (item && item[ok]) {
                    item[nk] = item[ok];
                    delete item[ok];
                    var nodes = item[nk];
                    if (nodes instanceof Array) {
                        nodes.changeItemMemberName(ok, nk);
                    }
                }
            }
        } else {
            var error = "不需要重命名，或无法重命名"
            console.error(error);
            return error;
        }
    };


    ////判断是否制定类型
    //Object.prototype.is = function (type) {
    //    return this instanceof type;
    //};

    Array.prototype.deleteItemMember = function (key) {
        for (var i in this) {
            var item = this[i];
            if (item) {
                delete item[key];
            }
        }
    };

    Array.prototype.resetItemMember = function (key, value) {
        for (var i in this) {
            this[i][key] = value === undefined ? {} : value;
        }
    };

    //Array.prototype.find = function (key, value) {
    //    for (var i in this) {
    //        this[i][key] = value === undefined ? {} : value;
    //    }
    //};
    //停止事件冒泡
    var stopmp = function (e) {
        e = e || event;
        e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
    };

    var opts = {
        lines: 11,// The number of lines to draw
        length: 9, // The length of each line
        width: 6, // The line thickness
        radius: 0, // The radius of the inner circle
        scale: 1, // Scales overall size of the spinner
        corners: 1, // Corner roundness (0..1)
        color: '#000', // #rgb or #rrggbb or array of colors
        opacity: 0.25,// Opacity of the lines
        rotate: 0,// The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        speed: 1,// Rounds per second
        trail: 54, // Afterglow percentage
        fps: 20,// Frames per second when using setTimeout() as a fallback for CSS
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        className: 'spinner', // The CSS class to assign to the spinner
        top: '50%', // Top position relative to parent
        left: '50%', // Left position relative to parent
        shadow: false, // Whether to render a shadow
        hwaccel: false,// Whether to use hardware acceleration
        position: 'absolute' // Element positioning
    };

    if (!jQuery.fn.valchange) {
        $.fn.extend({
            "valchange": function (val) {
                var result = this.val(val);
                if (val !== undefined) {
                    this.change();
                }
                return result;
            }
        });
    }
    $.fn.extend({
        'treeselect': function (urlordataoroption) {
            //树桩数据
            var treedata;
            var $this;
            var spin;
            var searchtime;
            var $tree = $('<div class="tree" style="display:none;" data-tree />');
            var $treecontainer = $("<div class='treecontainer'/>");
            var $treeinput = $("<input class='form-control'/>");
            var xtime = [];
            var search = false;

            var defaultoption = {
                "url": undefined,
                "displayfield": "text",
                "valuefield": "id",
                "nodesfield": "nodes",
                "remotesearch": false,
                "queryparameter": "query",
                "lazyload": true
            };

            if (urlordataoroption) {
                if (urlordataoroption instanceof Array) {
                    treedata = urlordataoroption;
                } else
                    if (isString(urlordataoroption)) {
                        defaultoption.url = urlordataoroption;
                    } else {
                        $.extend(defaultoption, urlordataoroption);
                    }
            } else {
                return "error,请传入数据或数据地址[JSON格式]";
            }
            $this = $(this);

            $this.wrap($treecontainer).hide()
                .parent()
                .append($treeinput)
                .append($tree);
            $treecontainer = $this.parent();
            $($treecontainer).on('click', stopmp);
            //$($treecontainer.find()).on('click', stopmp);
            spin = new Spinner(opts);
            var getquery = function (text) {
                var p = {};
                p[defaultoption.queryparameter] = text;
                return p;
            }
            var initData = function (data) {
                if (defaultoption.nodesfield !== "nodes") {
                    data.changeItemMemberName(defaultoption.nodesfield, "nodes")
                }

                data.resetItemMember("state");

                if (data.length === 0) {
                    data.push({ text: "没有匹配到结果", state: { disabled: true } });
                }
            }

            var sendRequest = function (url, option) {
                var opt = {
                    show: true,
                    callback: undefined
                };

                $.extend(opt, option);
                spin.spin($treecontainer[0]);
                $.getJSON(url, opt.query).done(function (data) {
                    initData(data);
                    if (opt.query === undefined) {
                        treedata = data;
                    }


                    if (opt.show) {
                        $tree.show();
                    }
                    //$this.data("source", data);
                    $this.trigger("getdata", [data]);
                    var tree = $tree.treeview({
                        data: data,
                        levels: opt.query == undefined ? 1 : 2,
                        selectedIcon: 'glyphicon glyphicon-ok',
                        onNodeSelected: function (event, data) {

                            //  debugger;
                            $treeinput.valchange(data[defaultoption.displayfield]);

                            $this.valchange(data[defaultoption.valuefield]);
                            $tree.hide(200);
                            if (!defaultoption.remotesearch) {
                                $tree.treeview("clearSearch");
                            }
                            if (search) {
                                treedata = null;
                            }
                        },
                        onNodeUnselected: function (event, data) {
                            //var $this = $(this);
                            $treeinput.valchange("");
                            $this.valchange("");
                            $tree.hide(200);
                        },
                        onSearchComplete: function (event, results) {
                            //$(this).addClass("searching");
                        },
                        onSearchCleared: function (event, results) {
                            //$(this).removeClass("searching");
                        }
                    });
                    var value = $this.val();
                    if (value) {
                        $tree.treeview('selectNode', [value, { silent: true }]);
                    }
                    if ($.isFunction(opt.callback)) {
                        opt.callback();
                    }
                }).always(function () {
                    spin.stop();
                }).fail(function () {
                    console.error("请求失败");
                });
            }
           

            if (!defaultoption.lazyload) {
                sendRequest(defaultoption.url, {
                    show: false,
                    callback: function () {
                        var inputid = $this.val();
                        if (inputid) {
                            $tree.treeview('selectNode', [inputid, { silent: true }]);
                            var getselected = $tree.treeview('getSelected');
                            var treeselected = getselected[0];
                            if (treeselected) {
                                $treeinput.val(treeselected.text);
                            }
                        }
                    }
                });
            }
            $treeinput.focus(function () {
                var value = $treeinput.val();
                var inputid = $this.val();
                if (inputid) {
                    var getselected = $tree.treeview('getSelected');
                    var treeselected = getselected[0];
                    if (treeselected && treeselected.id !== inputid) {
                        $tree.treeview('selectNode', [inputid, { silent: true }]);
                    } else if (getselected instanceof Array && getselected.length === 0) {
                        $tree.treeview('selectNode', [inputid, { silent: true }]);
                    }
                }
                if (value && treedata) {
                    return $tree.show();
                }
                var url = defaultoption.url;
                if (!treedata) {
                    sendRequest(url);
                } else {
                    $tree.show(200);
                }
            }).keyup(function (e) {
                var text = $(this).val();
                if (!defaultoption.remotesearch) {
                    if (text) {
                        $tree.treeview('search', [text, {
                            ignoreCase: true,     // case insensitive
                            exactMatch: false,    // like or equals
                            revealResults: true  // reveal matching nodes
                        }]);
                    } else {
                        $tree.treeview('clearSearch');
                    }
                } else {
                    if (text || search) {
                        search = true;
                        searchtime = new Date().getTime();
                        setTimeout(function () {

                            var x = new Date().getTime() - searchtime;
                            xtime.push(x);
                            if (x < 490) {
                                return;
                            }
                            sendRequest(defaultoption.url, { query: getquery(text) });
                            if (!text) {
                                search = false;
                            }
                        }, 500);
                    } else {
                        var getselected = $tree.treeview('getSelected');
                        var treeselected = getselected[0];
                        if (treeselected) {
                            $('#tree').treeview('unselectNode', [treeselected.id, { silent: false }]);
                        }
                        $treeinput.focus();
                    }
                }
            });

            return this;
        }
    });
    $(document).ready(function () {

        //$(document).on('click', ".treecontainer,.treecontainer *,.tree,icon", stopmp);
        $(document).click(function () {
            $("[data-tree]").hide();
        });

        $("[data-treeselect]").each(function (index, element) {
            var $element = $(element);
            var url = $element.data('dataurl');
            var displayfield = $element.data("display-field");
            var valuefield = $element.data("value-field");
            var nodesfield = $element.data("nodes-field");
            var remotesearch = $element.data("remotesearch");
            var queryparameter = $element.data("query");
            var lazyload = $element.data("lazyload");
            var option = {
                url: url,
                displayfield: displayfield,
                nodesfield: nodesfield,
                valuefield: valuefield,
                remotesearch: remotesearch,
                queryparameter: queryparameter,
                lazyload: lazyload
            };

            $element.treeselect(option);
        });
    });
}()