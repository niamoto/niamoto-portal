/**
* Problems management for forest visualization app.
*/

forest.problems = {};

forest.problems.problem_source = null;
forest.problems.problem_select = null;

forest.problems.popup = new olext.overlay.Popup({
    'positioning': 'bottom-center',
    'autoPan': true,
    'autoPanAnimation': {
        'duration': 250
    },
    'hide_callback': function() {
        forest.problems.setCurrentProblem(null);
        forest.problems.problem_select.getFeatures().clear();
    }
});

forest.problems.setCurrentProblem = function(problem) {
    forest.problems.showProblemPopup(problem);
};

forest.problems.showProblemPopup = function(problem) {
    if (problem) {
        var full_name = problem.get('creator_name')
        var title = '<b>' + full_name + '</b>';
        var coords = problem.getGeometry().getCoordinates();
        var pb_type = problem.get('problem');
        var pb = '';
        var comms = problem.get('comments');
        if (pb_type) {
            pb = '<em>' + pb_type + ' </em>';
        }
        if (comms) {
            pb = pb + ': ' + comms;
        }
        var creator = problem.get('creator_username');
        if (creator == username) {
            pb = pb + '\n<button id="delete_pb_button">Supprimer</button>';
        }
        forest.problems.popup.show(coords, title, pb);
        var del_button = document.getElementById("delete_pb_button");
        if (del_button != null) {
            del_button.addEventListener('click', function() {
                forest.problems.deleteProblem(problem);
            });
        }
    } else {
        forest.problems.popup.hide(function(){});
    }
};

forest.problems.deleteProblem = function(problem) {
    var csrftoken = $.cookie('csrftoken');
    $.ajaxSetup({
        'beforeSend': function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    });
    $.ajax({
        'url': 'delete_problem',
        'type': 'POST',
        'data': {
            'problem_id': problem.get('id')
        },
        'success': function(response) {
            forest.problems.problem_source.removeFeature(problem);
            forest.problems.setCurrentProblem(null);
            forest.problems.problem_select.getFeatures().clear();
        },
        'error': function(response) {
            msg = ["Erreur: Impossible de supprimer le problème.\n",
                   "Veuillez contacter l'administrateur du site si ",
                   "l'erreur persiste."];
            alert(msg.join(''));
        }
    });
};
