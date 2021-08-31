# python3 uwsgi

import cgi
import subprocess
import os
import re
import sys
import tempfile
import traceback

colors = {
    'ok': '#0D800F',
    'warn': '#C8B00F',
    'error': '#B00D0F',
}

def application(env, start_response):
    try:
        status, headers, lines = response_checker(env, start_response)
        start_response(status, headers)
        return lines
    except Exception as ex:
        traceback.print_exc()
        status = '500 Internal Server Error'
        start_response(status, [('Content-Type','text/html')])
        return [f'<!DOCTYPE html><html><head><title>{status}</title></head><body style="text-align: center;"><h1>{status}</h1><h2>Oops! Something went wrong :(</h2></body></html>'.encode()]

def response_checker(env, start_response):
    status, lines = main(env, start_response)
    if status == '200 OK':
        return (status, [('Content-Type','text/html')], ['\n'.join(lines).encode()])
    headers = []
    if status == '302 Found' or status == '301 Moved Permanently':
        headers += [('location', lines)]
        return (status, headers, [])
    headers += [('Content-Type','text/html')]
    lines = [f'<!DOCTYPE html><html><head><title>{status}</title></head><body style="text-align: center;"><h1>{status}</h1>']
    if status == '400 Bad Request':
        lines += [f'<h2>Bro</h2><img src="/images/thonk.svg" alt="thonk">']
    elif status == '404 Not Found':
        lines += [f'<h2>I can’t find them. There’s only soup.</h2><img src="/images/soup.jpg" alt="soup">']
    elif status == '405 Method Not Allowed':
        lines += [f'<h2><a href="/azur-lane/pr-data/">Go Back</a></h2><img src="/images/thonk.svg" alt="thonk">']
    else:
        lines += [f'<h2>Thonk</h2><img src="/images/thonk.svg" alt="thonk">']
    lines += [f'</body></html>']
    return (status, [('Content-Type','text/html')], ['\n'.join(lines).encode()])

def main(env, start_response):
    if env['REQUEST_URI'] != '/azur-lane/pr-data/':
        return ('404 Not Found', None)
    if not is_post_request(env):
        with open('pr-data/header.html') as header, open('pr-data/tail.html') as tail:
            return ('200 OK', [header.read(), tail.read()])
    form = get_post_form(env)
    project_series = form.getvalue('project-series', '')
    project_type = form.getvalue('project-type', '')
    project_name = form.getvalue('project-name', '')
    results_screenshot = form['results-screenshot']
    if project_series == '' or project_name == '' or results_screenshot is None or results_screenshot.filename is None or results_screenshot.filename == '':
        return ('400 Bad Request', None)
    fd, tmp_name = tempfile.mkstemp(prefix='pr-data-', dir='/tmp/')
    tmp = os.fdopen(fd, mode='w+b')
    tmp.write(results_screenshot.file.read())
    status = subprocess.run(['pr-data/image-uploaded.sh', tmp_name, results_screenshot.filename, project_series, project_type, project_name], capture_output=True).stdout.decode()
    with open('pr-data/success.html') as success_file:
        success = success_file.read()
    status_dict = {}
    for line in status.splitlines():
        match = re.match(r'(\w+):\s(.*)', line)
        if not match:
            print(line)
        k, v = match.group(1, 2)
        status_dict[k] = v
    success = success.replace('COLOR', colors[status_dict['color']], 1)
    success = success.replace('STATUS', status_dict['status'], 1)
    success = success.replace('EXTRA', status_dict['extra'], 1)
    with open('pr-data/header.html') as header, open('pr-data/tail.html') as tail:
        return ('200 OK', [
            header.read(),
            success,
            tail.read(),
        ]);

def is_post_request(environ):
    if environ['REQUEST_METHOD'].upper() != 'POST':
        return False
    return environ.get('CONTENT_TYPE', '').startswith('multipart/form-data')

def get_post_form(environ):
    input = environ['wsgi.input']
    post_form = environ.get('wsgi.post_form')
    if (post_form is not None
        and post_form[0] is input):
        return post_form[2]
    # This must be done to avoid a bug in cgi.FieldStorage
    environ.setdefault('QUERY_STRING', '')
    fs = cgi.FieldStorage(fp=environ['wsgi.input'],
                          environ=environ,
                          keep_blank_values=1)
    new_input = InputProcessed()
    post_form = (new_input, input, fs)
    environ['wsgi.post_form'] = post_form
    environ['wsgi.input'] = new_input
    return fs

class InputProcessed(object):
    def read(self, *args):
        raise EOFError('The wsgi.input stream has already been consumed')
    readline = readlines = __iter__ = read
