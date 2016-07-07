# coding: utf-8

import json
import uuid

from django.contrib.gis.geos.point import Point
from django.core.exceptions import ObjectDoesNotExist
from django.http.response import HttpResponse, Http404
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from constance import config
from pyproj import Proj, transform

from apps.forest_digitizing.models import Massif
from apps.forest_digitizing.models import DigitizingProblem


@login_required()
def massifs_index(request):
    massifs = Massif.objects.select_related('assignation__operator')
    massif_data = dict()
    for m in massifs:
        k_n = m.key_name
        massif_data[k_n] = {
            'status': 0,
            'operator': '',
            'status_display': 'Inconnu',
            'file_available': False
        }
        if hasattr(m, 'assignation'):
            assign = m.assignation
            massif_data[k_n]['status'] = assign.status
            massif_data[k_n]['status_display'] = assign.get_status_display()
            file_available = assign.spatialite_file not in ('', None)
            massif_data[k_n]['file_available'] = file_available
            if hasattr(m.assignation, 'operator'):
                n = m.assignation.operator.get_full_name()
                massif_data[k_n]['operator'] = n
    return render(request, 'forest_digitizing/massifs.html', {
        'GEOSERVER_BASE_URL': config.GEOSERVER_BASE_URL,
        'massifs': massifs.order_by('key_name'),
        'massif_data': json.dumps(massif_data),
    })


@login_required()
def forest_index(request, massif_key_name=None):
    if massif_key_name is None:
        raise Http404()
    try:
        massif = Massif.objects.get(key_name=massif_key_name)
        return render(request, 'forest_digitizing/forest.html', {
            'GEOSERVER_BASE_URL': config.GEOSERVER_BASE_URL,
            'massif': massif,
        })
    except ObjectDoesNotExist:
        raise Http404("Massif does not exist")
    except:
        raise Http404("")


@login_required()
def add_problem(request, massif_key_name=None):
    if request.method == 'POST' and massif_key_name is not None:
        user = request.user
        x1, y1 = float(request.POST.get('x')), float(request.POST.get('y'))
        in_proj = Proj(init='EPSG:32758')
        out_proj = Proj(init='EPSG:4326')
        x2, y2 = transform(in_proj, out_proj, x1, y1)
        problem_type = request.POST.get('problem')
        comment = request.POST.get('comment')
        massif = Massif.objects.get(key_name=massif_key_name)
        pb = DigitizingProblem(uuid=uuid.uuid1(), massif=massif,
                               location=Point(x2, y2), created=timezone.now(),
                               created_by=user, problem=problem_type,
                               comments=comment)
        pb.save()
        return HttpResponse(json.dumps({
            'id': pb.id,
            'problem': pb.problem,
            'creator_full_name': user.get_full_name(),
            'creator_username': user.username,
            'comments': pb.comments,
        }))


@login_required()
def delete_problem(request, massif_key_name=None):
    if request.method == 'POST':
        user = request.user
        problem_id = request.POST.get('problem_id')
        problem = DigitizingProblem.objects.get(id=problem_id)
        if problem.created_by == user:
            problem.delete()
            return HttpResponse()
