$(function(){
    $('a').each(function() {
        if ($(this).prop('href') == window.location.href) {
        $(this).addClass('current');
        }
    });
});

window.onload = function() {
	var selectFuntion = document.getElementById('selectFuntion');
	var runButton = document.getElementById('runButton');
	var fileInput = document.getElementById('fileInput');
	var fx = createBoxPlot; // Because boxplot is the first option
	$('#selectFunction').on('change', function() {
		if (selectFunction.options[selectFunction.selectedIndex].value == "continuous") {
			fx = createScatter;
		} else if (selectFunction.options[selectFunction.selectedIndex].value == "binary") {
			fx = createBoxPlot;
		} else if (selectFunction.options[selectFunction.selectedIndex].value == "survival") {
			fx = getInputDataAndDrawKM;
		} else if (selectFunction.options[selectFunction.selectedIndex].value == "scatterplot") {
			fx = scatter2;
		} else if (selectFunction.options[selectFunction.selectedIndex].value == "venn") {
			fx = console.log;
		} else if (selectFunction.options[selectFunction.selectedIndex].value == "heatmap") {
			fx = console.log;
		}
	});
	runButton.addEventListener('click', function(e) {
		e.preventDefault();
		var file = fileInput.files[0];
		var url = window.URL.createObjectURL(file);
		fx(url);
	});
};
