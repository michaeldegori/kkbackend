import json
from botocore.vendored import requests

def lambda_handler(event, context):
    response = requests.get('https://api.kiddiekredit.com/healthcheck')
    if response.text != 'health check succeeded':
        return {
            'statusCode': 404,
            'body': json.dumps('need to trigger cw alarm before sending this back')
        }

    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
