# coding: utf-8

import sys
import argparse
import re
from tempfile import mkstemp
from shutil import move
from os import remove, close, linesep

from django.utils.crypto import get_random_string


SECRET_KEY_SETTINGS = "SECRET_KEY = '%s'" + linesep
SECRET_KEY_PATTERN = r'^SECRET_KEY ?='


def handle(**options):
    # Create a random SECRET_KEY to put it in the main settings.
    chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)'
    rnd_str = get_random_string(50, chars)

    if options['print']:
        _print_random_string(rnd_str)
    elif options['path']:
        _replace_in_file(rnd_str, options['path'])
    else:
        _print_django_key(rnd_str)


def _replace_line(file_path, line_pattern, new_line):
    fh, temp_path = mkstemp()
    with open(temp_path, 'w') as new_file:
        with open(file_path) as old_file:
            for line in old_file:
                secret_key = re.match(line_pattern, line)
                if secret_key:
                    line = new_line
                new_file.write(line)

    close(fh)
    remove(file_path)
    move(temp_path, file_path)


def _print_random_string(rnd_str):
    sys.stdout.write(rnd_str + "\n")


def _print_django_key(rnd_str):
    sys.stdout.write(SECRET_KEY_SETTINGS % rnd_str)


def _replace_in_file(rnd_str, path):
    try:
        _replace_line(path, SECRET_KEY_PATTERN,
                      SECRET_KEY_SETTINGS % rnd_str)
    except IOError:
        sys.stdout.write('Could not replace the value in file.'
                         'Check if file {} exists.'.format(path))


parser = argparse.ArgumentParser()
parser.add_argument('--print', action='store_true')
parser.add_argument('--path')
args = parser.parse_args()

if __name__ == "__main__":
    handle(**vars(args))
