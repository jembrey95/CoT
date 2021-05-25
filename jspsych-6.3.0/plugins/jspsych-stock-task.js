/* slider response with labels on top */ 

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
            slider_start: {                                   
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Slider starting value',
                default: (Math.floor(Math.random() * 99) + 1),          // random number from 1-99
                description: 'Sets the starting value of the slider',
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
                default: ["99c", "0c", "99c"],
                array: true,
                description: 'Labels of the slider.',
            },
            slider_width: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Slider width',
                default: null,
                description: 'Width of the slider in pixels.'
            },
            button_label: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button label',
                default: 'Continue',
                array: false,
                description: 'Label of the button to advance.'
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
            response_ends_wtp: {
                type: jsPsych.plugins.parameterType.BOOL,
                default: true,
                description: 'If true, WTP choice screen will end when user makes a response.'
            }
        }
    }

    plugin.trial = function (display_element, trial) {

/* --------------- SET UP DIVS AND VARIABLES ---------------- */

        // initialise data storage
        var responses = {
            marketTrial: null,
            marketValue: null,
            marketChange: null,  
            portfolioValue: null,  
            portfolioChange: null,
            reveal: null,
            leftOption: null,
            rightOption: null,
            wtp: null,
            wtpRecode: null,
            sliderRt: null,
            sliderStart: trial.slider_start,
        };

        // update values for this trial (initialised in html doc)
        trialNumber++
        const z = trialNumber
        responses.marketTrial = z
        responses.marketValue = MV[z]
        responses.marketChange = change[z]
        
        //add content to css class to apply stock-market css 
        const content = document.querySelector('#jspsych-content');
        content.classList.add("stock-grid-container");

        var startTime = null;
        var inputDiv = null;
        var timeout = null;


        // display_element identifies divs
        display_element.innerHTML = `
            <div id="outcome" class="outcome number clear"></div>
            <div id="sliderregion" class="sliderregion clear"></div>
            <div id="text" class="text clear"></div>
            <div id="chart" class="chart"></div>
            <div id="leftOption" class="leftOption clear"></div>
            <div id="rightOption" class="rightOption clear"></div>
            <div id="yaxis" class="yaxis clear"></div>`;


/* >>>>>>>>>>>>>>>>>> SEQUENCE <<<<<<<<<<<<<<<<<<<< */

        //setup values 
        randomiseSide();
    
        function randomiseSide() {
            var order = jsPsych.randomization.sampleWithoutReplacement(["YES", "NO"], 2);

            var sides = {
                leftOption: order[0],
                rightOption: order[1]
            };
            responses.leftOption = sides.leftOption
            responses.rightOption = sides.rightOption
            console.log(sides);
        };  
        
        updatePV();

        function updatePV() {
            var updateProb = jsPsych.randomization.sampleWithReplacement([0, 1], 1, [.65, .35]);
            // if follow market then:
            if (updateProb == 0) {                        
                pv = pv + change[z]
                responses.portfolioChange = change[z];
                PV.push(pv);
                console.log[change[z], pv];
            } else {
                // otherwise, random change in opp. direction as market 
                let x = parseInt(Math.floor(Math.random() * (15 - 0) + 0).toFixed(2));
                change[z] > 0 ? (pv = pv - x) : (pv = pv + x);
                change[z] > 0 ? responses.portfolioChange = -x : responses.portfolioChange = x 
            };
            responses.portfolioValue = pv;
            console.log(responses.portfolioValue);
            console.log("updatePV");
            if (trialNumber == 1) {generateChart()} 
            else {animate()};
        };

        generateChart();
    
        function generateChart()  {
            var m = {t: 50, b: 50, l: 50, r: 50};
            var height = 550
            var width = 800
            
            var svg = d3.select("#chart")       // create another div layer? 
            .append("svg")
            .attr("width", width)
            .attr("height", height)

            // scaling x/y to chart height/width 
            var xScale = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) {return (d)[0]})])
            .range([m.l, width - m.r]);

            var yScale = d3.scaleLinear()
            .domain([-40, 40])                          // set to limit 
            .range([height - m.b, m.t])

            // setting x and y values
            var line = d3.line()
            .x(function(d) {return xScale((d)[0])})     // apply scale to line 
            .y(function(d) {return yScale((d)[1])})

            //axis
            var xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks("")

            var yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks("")

            // draw axes 

            svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0,${(height - m.b + m.t)/2})`)
            .call(xAxis);

            svg.append('g')
            .attr('class', 'y axis')
            .attr("transform", `translate(${m.l},0)`)
            .call(yAxis)

            var path = svg.append("path")
            .datum(data)
            .attr("scale", `${yScale}`)
            .attr("scale", `${xScale}`)
            .attr("fill", "none")
            .attr("stroke", "steelblue")    
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")    
            .attr("stroke-width", 3)
            .attr("d", line)

            var totalLength = path.node().getTotalLength();

            path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .attr("stroke-linecap", "round")
            .attr("class", "animate");


            $("path").toggleClass("paused");
            $("#chart").toggleClass("chartvis");
            animate();
        };

        function animate() {
            $("#chart").toggleClass("chartvis");
            $("#yaxis").html("Global market value");
            console.log("animate");
            jsPsych.pluginAPI.setTimeout(unpause, 2000)
        };

        function unpause() {
            $("path").toggleClass("paused");
            console.log("unpause");
            jsPsych.pluginAPI.setTimeout(pause, 2300);
        };
        function pause() {
            $("path").toggleClass("paused");
            console.log("pause");
            document.addEventListener("click", hideChart);
        }; 

        // from pause 
        function hideChart() {
            $("#chart").toggleClass("vis");
            $("#yaxis").html("");
            document.removeEventListener("click", hideChart);
            wtpScale();
        };      
            
        function wtpScale() {

            startTime = performance.now(); 

            display_element.querySelector("#text").innerHTML = 
                '<p style="top: 10%; font-size: 140%">Would you like to know your portfolio value now?</p>'
            display_element.querySelector("#leftOption").innerHTML = 
                `<p style="font-size: 140%">${responses.leftOption}</p>`

            display_element.querySelector("#rightOption").innerHTML = 
                `<p style="font-size: 140%">${responses.rightOption}</p>`

            var html = '<div class="jspsych-canvas-slider-response-container" style="position:relative; margin: 0 auto 3em auto; width:';
            if (trial.slider_width !== null) {
                html += trial.slider_width + 'px;';
            }
            html += '">';
            html += '<input type="range" value="' + trial.slider_start + '" min="' + trial.min + '" max="' + trial.max + '" step="' + trial.step + '" style="width: 100%;" id="jspsych-canvas-slider-response-response"></input>';
            html += '<div>'
            for (var j = 0; j < trial.labels.length; j++) {
                var width = 100 / (trial.labels.length - 1);
                var left_offset = (j * (100 / (trial.labels.length - 1))) - (width / 2);
                html += '<div style="display: inline-block; position: absolute; left:' + left_offset + '%; text-align: center; width: ' + width + '%;">';
                html += '<span style="text-align: center; font-size: 80%;">' + trial.labels[j] + '</span>';
                html += '</div>'
            };

            inputDiv = "#jspsych-canvas-slider-response-response";
            display_element.querySelector("#sliderregion").innerHTML = html;
            console.log("wtpScale");
            timeout = setTimeout(expired, 5000);
            timeout;
            $(inputDiv).on("click", endSlider);
        }

        function expired() {
            $(inputDiv).off("click", endSlider);
            $(".clear").html("");
            display_element.querySelector("#outcome").innerHTML = `<p style="color: red">Too slow!</p>`;
            setTimeout(endSlider, 1500);
            console.log("expired");
        }; 

        function endSlider() {
            $(inputDiv).off("click", endSlider);
            clearTimeout(timeout);

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
            let possibleOutcomes = [pv, "XXXX"];
            responses.reveal = jsPsych.randomization.sampleWithReplacement(possibleOutcomes, 1, outcomeProb);
            console.log(responses.reveal)
           
            var endTime = performance.now();
            responses.sliderRt = (endTime - startTime)/100;
            responses.wtp = $("input[type=range]").val();
            responses.wtpRecode = (responses.leftOption == "YES") ? (responses.wtp * -1): responses.wtp;
            console.log(responses.wtpRecode)
            $("#outcome").html("");
            $(".clear").html("");
            setTimeout(displayDay, 1500)
        };

        // from main displayPV   
        function displayDay() {

            $("#text").html(`<p style="top: 10%; font-size: 140%">Your total portfolio on Day ${trialNumber}</p>`);
            setTimeout(displayPV, 1500);
            console.log("displayDay");
        };

        function displayPV() {
            $("#outcome").html(`<p style="font-size: 140%">${responses.reveal}</p>`);
            setTimeout(endTrial, 2000);
            console.log("displayPV")
        };   

        function endTrial() {
            console.log("endTrial")
            console.log(responses);
            responses;
            jsPsych.finishTrial(responses);
        };
        
    };

    return plugin;

})();