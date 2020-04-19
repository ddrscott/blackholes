import xmltodict
import pprint
import json

with open('public/images/round_nodetailsOutline.xml') as fd:
    doc = xmltodict.parse(fd.read())

pp = pprint.PrettyPrinter(indent=4)
pp.pprint(doc)

"""
OrderedDict([   (   'TextureAtlas',
                    OrderedDict([   (   '@imagePath',
                                        'round_nodetailsOutline.png'),
                                    (   'SubTexture',
                                        [   OrderedDict([   (   '@name',
                                                                'bear.png'),
                                                            ('@x', '547'),
                                                            ('@y', '545'),
                                                            ('@width', '136'),
                                                            (   '@height',
                                                                '137')]),
"""
atlas = {
    'frames': [
        {
            'filename': frame['@name'].split('.')[0],
            'frame': {
                'x': int(frame['@x']),
                'y': int(frame['@y']),
                'w': int(frame['@width']),
                'h': int(frame['@height']),
            }
        }
        for frame in doc['TextureAtlas']['SubTexture']
    ]
}

with open('public/images/round_nodetailsOutline.json', 'w') as fd:
    fd.write(json.dumps(atlas, indent=4))
