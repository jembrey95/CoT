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
            sliderStart: trial.slider_start
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

        // display_element identifies divs
        display_element.innerHTML = `
        <div id="outcome" class="outcome number clear"></div>
        <div id="sliderregion" class="sliderregion clear"></div>
        <div id="text" class="text clear"></div>
        <div id="chart" class="chart"></div>
        <div id="leftOption" class="leftOption clear"></div>
        <div id="rightOption" class="rightOption clear"></div>`;

        var outcomeDiv = display_element.querySelector("#outcome");
        var sliderDiv = display_element.querySelector("#sliderregion");
        var textDiv = display_element.querySelector("#text");
        var chartDiv = display_element.querySelector("#chart");
        var leftDiv = display_element.querySelector("#leftOption");
        var rightDiv = display_element.querySelector("#rightOption");


/* >>>>>>>>>>>>>>>>>> FUNCTIONS <<<<<<<<<<<<<<<<<<<< */

    // graph control

    function chartblock() {
        function animate() {
            $("#chart").toggleClass("chartvis");
            console.log("animate");

        function unpause() {
            $("path").toggleClass("paused");
            console.log("unpause");
        };

        function pause() {
            $("path").toggleClass("paused");
            console.log("pause");
            $(document).on("click", wtpSection);
        }; 
    }


    // updateportfolio: 65% follow market trend, else opp. direction random magnitude

        function updatePV() {
            var updateProb = jsPsych.randomization.sampleWithReplacement([0, 1], 1, [.65, .35]);
            // if follow market then:
            if (updateProb == 0) {                        
                pv = pv + change[z]
                responses.portfolioChange = change[z]
                console.log[change[z], pv];
            } else {
                // otherwise, random change in opp. direction as market 
                let x = parseInt(Math.floor(Math.random() * (15 - 0) + 0).toFixed(2));
                change[z] > 0 ? (pv = pv - x) : (pv = pv + x);
                change[z] > 0 ? responses.portfolioChange = -x : responses.portfolioChange = x 
            };
            responses.portfolioValue = pv
            console.log(responses.portfolioValue)
        };

/* -------------- WTP SLIDER SCREEN ----------------- */


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
                       
        function wtpScale() {

            $("#chart").toggleClass("chartvis");
            var startTime = performance.now(); 

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

            console.log(display_element);

            display_element.querySelector("#sliderregion").innerHTML = html;

            // on click, record measures 
            $('#jspsych-canvas-slider-response-response').on("click", endSlider);

            jsPsych.pluginAPI.setTimeout(expired, trial.slider_duration)

                function endSlider() {
                    jsPsych.pluginAPI.clearAllTimeouts();
                    document.getElementsByClassName("clear").innerHTML = "";
                    var endTime = performance.now();
                    responses.sliderRt = endTime - startTime;
                    responses.wtp = display_element.querySelector('#jspsych-canvas-slider-response-response').valueAsNumber;
                    responses.wtpRecode = (responses.leftOption == "YES") ? (responses.wtp * -1): responses.wtp;
                    //displayPortfolio
                };  



/* ------------ REVEAL/HIDE SCREEN ---------- */

        function displayPortfolio () {
            jsPsych.pluginAPI.clearAllTimeouts();
            let a = responses.wtpRecode;
            let outcomeProb = 
                a >= -99 ? [.05, .95] :
                a >= -80 ? [.15, .85] :
                a >= -60 ? [.25, .75] :
                a >= -40 ? [.35, .65] :
                a >= -20 ? [.45, .55] :
                a = 0 ? [.50,.50] :
                a >= 1 ? [.55,.45] :
                a >= 21 ? [.85, .15] :
                a >= 41 ? [.75, .25] :
                a >= 61 ? [.85, .15] :
                a >= 81 ? [.95, .05] :
                null;
            let possibleOutcomes = [pv, "XXXX"];
            responses.reveal = jsPsych.randomization.sampleWithReplacement(possibleOutcomes, 1, outcomeProb);
            display_element.querySelector("#outcome").innerHTML = `${responses.reveal}`;
            jsPsych.pluginAPI.setTimeout(endTrial, 3000)
        };

        function endTrial() {
            jsPsych.pluginAPI.clearAllTimeouts();
            //content.classList.remove("stock-grid-container");
            display_element.innerHTML = "";
            jsPsych.finishTrial(responses);

        };

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
        }
    
    // execute sequence

      $(document).ready(function() {

      //setup values 
      randomiseSide();
      updatePV();
      if (trialNumber == 1) {generateChart()};
      chartblock();
      
      function wtpSection() {
        wtpScale();


      }
      
  });
};

    return plugin;

})();