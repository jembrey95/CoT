jsPsych.plugins['stock-task'] = (function () {

    var plugin = {};

    plugin.info = {
        name: 'stock-task',
        description: '',
        parameters: {

            min: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Min slider',
                default: -99,
                description: 'Sets the minimum value of the slider.'
            },
            max: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Max slider',
                default: 99,
                description: 'Sets the maximum value of the slider',
            }, 
            step: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Step',
                default: 1,
                description: 'Sets the step of the slider'
            },
            labels: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Labels',
                default: ["99pts", "50", "0", "50", "99pts"],
                array: true,
                description: 'Labels of the slider.',
            },
            slider_width: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Slider width',
                default: null,
                description: 'Width of the slider in pixels.'
            },
            slider_prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: null,
                description: 'Any content here will be displayed above the slider.'
            },
            slider_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Trial duration',
                default: 3000,
                description: 'Response time limit for slider.'
            },
        }
    }

    plugin.trial = function (display_element, trial) {
        
/* --------------- SET UP DIVS AND VARIABLES ---------------- */

        slider_start = Math.floor(Math.random() * (99 - (-99) + 1) + (-99));

        trialNumber++
        const z = trialNumber

        // initialise data storage
        var responses = {
            condition: parseInt(condition),
            marketTrial: z,
            marketValue: MV[z],
            marketChange: change[z],  
            portfolioValue: PVarray[z],  
            portfolioChange: PVchange[z],
            reveal: null,
            leftOption: sides.leftOption,
            rightOption: sides.rightOption,
            wtp: null,
            wtpRecode: null,
            sliderRt: null,
            sliderStart: slider_start,
            followMarket: Varray[z],
        };

        // update values for this trial (initialised in html doc)

        //add content to css class to apply stock-market css 
        const content = document.querySelector('#jspsych-content');
        content.classList.add("stock-grid-container");

        var startTime = null;
        var inputDiv = null;
        var timeout = null;

        // set up display elements
        display_element.innerHTML = `
            <div id="outcome" class="outcome number clear"></div>
            <div id="sliderregion" class="sliderregion clear"></div>
            <div id="text" class="text clear"></div>
            <div id="chart" class="chart"></div>
            <div id="leftOption" class="leftOption clear"></div>
            <div id="rightOption" class="rightOption clear"></div>
            <div id="bottom" class="bottom clear"></div>
            <div id="index" class="index"></div>
            <div id="week" class="clear"></div>`

            var globalindex = 
               `<div id="global">` +
                    `<p>Global Index</p>` +
                `</div>` +
               `<div id="corps">` +
                    `<div>${corp[rnd[0]]}</div>` +
                    `<div>${corp[rnd[1]]}</div>` +
                `</div>`+
                `<div id="other1">` +
                    `<div>${corp[rnd[2]]}</div>` +
                    `<div>${corp[rnd[3]]}</div>` +
                    `<div>${corp[rnd[4]]}</div>` +
                `</div>` +
                `<div id="corplab" class="${ethiclabel}"><b>${label}</b></div>` +
                `<div id="other2"><b>? ? ?</b></div>`



/* >>>>>>>>>>>>>>>>>> SEQUENCE <<<<<<<<<<<<<<<<<<<< */

        //setup values 

        /* updatePV();

        function updatePV() {
            var updateProb = jsPsych.randomization.sampleWithReplacement([0, 1], 1, [.65, .35]);
            // if follow market then:
            if (updateProb == 0) {                        
                pv = pv + change[z]
                responses.portfolioChange = change[z];
                console.log[change[z], pv];
            } else {
                // otherwise, random change in opp. direction as market
                let x = generateChange(0, 70);
                console.log("random opp", x)
                change[z] > 0 ? (pv = pv - abs(x)) : (pv = pv + abs(x));
                change[z] > 0 ? responses.portfolioChange = -abs(x) : responses.portfolioChange = abs(x) 
            };
            responses.portfolioValue = Math.round(pv);
            console.log(responses.portfolioValue);
            console.log("updatePV");
        }; */ 
    
        generateChart();

        function generateChart()  {
            var height = .95 * document.getElementById("chart").clientHeight // used to be 550
            var width = document.getElementById("chart").clientWidth // used to be 1200
            var pad = {
                h: .1 * height,
                w: .09 * width, 
            };
            
            var svg = d3.select("#chart")       // create another div layer? 
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("x", "100")
            .attr("y", "100")

            // scaling x to chart width 
            var xScale = d3.scaleLinear()
            .domain([-0.05, d3.max(sdata, function(d) {return (d)[0]})])
            .range([pad.w, width - pad.w]);

            var yScale = d3.scaleLinear()
            .domain([-160, 160])                          // set to limit 
            .range([height, 0])

            // setting x and y values
            var line = d3.line()
            .x(function(d) {return xScale((d)[0])})     // apply scale to line 
            .y(function(d) {return yScale((d)[1])})

            //axis
            var xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(53)

            var yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks("")

            // draw axes 

            var path = svg.append("path")
            .datum(sdata)
            .attr("scale", `${yScale}`)
            .attr("scale", `${xScale}`)
            .attr("fill", "none")
            .attr("stroke", "steelblue")    
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")    
            .attr("stroke-width", 3)

            var totalLength = path.node().getTotalLength();

            path
            .attr("stroke-dasharray", totalLength)
            .attr("stroke-dashoffset", totalLength)
            .attr("d", line)
            
            // curtain covering chart 
            svg.append("rect")
            .attr("width", `${width - 2*(pad.w) + 3}px`)
            .attr("height", `${height}px`)
            .attr("fill", "white")                     // gold to check 
            .attr("class", "animate")
            .attr("x", "100")
            .attr("border")
            //.style("fill-opacity", "50%")  //for checking if things work

            svg.append('g')
            .attr('class', 'x axis')
            .style("stroke-dasharray", "6")
            .attr('transform', `translate(0,${(height - pad.h + pad.h)/2})`)
            .call(xAxis);

            svg.append('g')
            .attr('class', 'y axis')
            .attr("transform", `translate(${pad.w},0)`)
            .call(yAxis)

            svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x",`-${height/2}`)
            .attr("y", "65")
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr("font-size", "2em")
            .text("Global Index Value");  

            // width of x axis 
            xlength = width - 2 * pad.w

            //reveal rect by 1/52th per trial
            let start = pad.w + (xlength/52 * (z-1))               // adjust the divided 20px to fit 52 ticks
            let end = pad.w + (xlength/52 * z) - 1                 // find the length of the x-axis (-1 to lag behind)

            $.keyframe.define({
                name: 'curtain',
                from: {
                    'x': `${start}px`,
                    'marginRight': `${pad.w}px`
                },
                to: {
                    'x': `${end}px`,
                    'marginRight': `${pad.w}px`
                }
            });

            $("rect").toggleClass("paused");
            $("#chart").toggleClass("vis");
            animate();
        };
        

// **************** BEGIN TRIAL SEQUENCE ******************** \\ 

        function animate() {
            $("#chart").toggleClass("vis");
            $(".index").html(globalindex);
            //console.log("animate");
            jsPsych.pluginAPI.setTimeout(unpause, 1000)             // 1000 default
        };

        function unpause() {
            $("rect").toggleClass("paused");
            //console.log("unpause");
            jsPsych.pluginAPI.setTimeout(pause, 2300);              // 2300 default
        };
        function pause() {
            $("rect").toggleClass("paused");
            //console.log("pause");
            jsPsych.pluginAPI.setTimeout(next, 1000);               // 1000 default
        }

        function next() {
            $(".bottom").html("Click anywhere to continue");
            document.addEventListener("click", hideChart);
        }; 

        // from pause 
        function hideChart() {
            $("#chart").toggleClass("vis");
            $(".clear").html("");
            document.removeEventListener("click", hideChart);
            wtpScale();
        };      
            
        function wtpScale() {

            startTime = performance.now(); 

            $("#text").html(
                '<p style="top: 10%; font-size: 150%; margin-top:3%"></br>Would you like to know your portfolio value now?</p>');

            $("#leftOption").html(
                `<p style="font-size: 150%;text-align:right">${responses.leftOption}</p>`)

            $("#rightOption").html(`<p style="font-size:150%; text-align:left">${responses.rightOption}</p>`) 

            var ticks = "<svg width='100%' height='10' style='transform:translate(0, -250%)'>";
            for (i = 1; i < 20; i++) {
                ticks += `<rect style='fill:gray' x='${i * 100/20}%' y='3' width='1' height='10'></rect>`
            }
            ticks += "</svg>"

            var html = '<div class="jspsych-canvas-slider-response-container" style="position:relative; margin: 0 auto 3em auto; width:';
            if (trial.slider_width !== null) {
                html += trial.slider_width + 'px;';
            }
            html += '">';
            html += '<input type="range" value="' + slider_start + '" min="' + trial.min + '" max="' + trial.max + '" step="' + trial.step + '" style="width: 100%; margin-bottom: 3%" id="jspsych-canvas-slider-response-response"></input>';
            html += '<div>'
            for (var j = 0; j < trial.labels.length; j++) {
                var width = 100 / (trial.labels.length - 1);
                var left_offset = (j * (100 / (trial.labels.length - 1))) - (width / 2);
                html += '<div style="display: inline-block; position: absolute; left:' + left_offset + '%; text-align: center; width: ' + width + '%;">';
                html += '<span style="text-align: center; font-size: 80%;">' + trial.labels[j] + '</span>';
                html += '</div>'
            };

            inputDiv = "#jspsych-canvas-slider-response-response";
            $("#sliderregion").html(html + ticks);
            //console.log("wtpScale");
            //timeout = setTimeout(expired, 5000);
            //timeout;
            $(inputDiv).on("click", endSlider);
        }

        function expired() {
            $(inputDiv).off("click", endSlider);
            $(".clear").html("");
            $("#outcome").html(`<p style="color: red">Too slow!</p>`)
            setTimeout(endSlider, 1500);
        }; 

        function endSlider() {
            $(inputDiv).off("click", endSlider);
            //clearTimeout(timeout);
            
            responses.wtp = $("input[type=range]").val();
            responses.wtpRecode = (responses.leftOption == "YES") ? (responses.wtp * -1): responses.wtp;
            console.log("recoded", responses.wtpRecode)

            let a = responses.wtpRecode;
            let outcomeProb = 
                a <= -81 && a >= -99 ? [.05, .95] :
                a <= -61 && a >= -80 ? [.15, .85] :
                a <= -41 && a >= -60 ? [.25, .75] :
                a <= -21 && a >= -40 ? [.35, .65] :
                a <= -1 && a >= -20 ? [.45, .55] :
                a >= 1 && a <= 20 ? [.55,.45] :
                a >= 21 && a <= 40 ? [.85, .15] :
                a >= 41 && a <= 60 ? [.75, .25] :
                a >= 61 && a <= 80 ? [.85, .15] :
                a >= 81 && a <= 99 ? [.95, .05] :
                [.50, .50];
            let possibleOutcomes = [Math.round(PVarray[z]), "XXXX"];
            responses.reveal = String(jsPsych.randomization.sampleWithReplacement(possibleOutcomes, 1, outcomeProb));
            //console.log("outcomeProb", outcomeProb, responses.reveal)
           
            var endTime = performance.now();
            responses.sliderRt = (endTime - startTime)/100;

            $("#outcome").html("");
            $(".clear").html("");
            setTimeout(displayWeek, 1000)
        };

        // from main displayPV   
        function displayWeek() {
            $("#text").html(`<p style="top: 10%; font-size: 180%">Your portfolio value in Week ${z}</p>`);
            setTimeout(displayPV, 1000);
        };

        function displayPV() {
            $("#outcome").html(`<p style="font-size: 180%">${responses.reveal}</p>`);
            setTimeout(removeGrid, 2000);
        };   

        // endTrial is still running when next trial begins - safer to separate formatting changes 
        function removeGrid() {
            content.classList.remove("stock-grid-container");
            endTrial()
        }

        function endTrial() {
            console.log(responses);
            all_data.push(Object.values(responses));
            jsPsych.finishTrial(responses);

        };
    };

    return plugin;

})();