from flask import Flask, request, jsonify, send_from_directory, url_for
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import uuid
import matplotlib
matplotlib.use('Agg')
import numpy as np
import matplotlib.pyplot as plt
from pyxtf import xtf_read, concatenate_channel, XTFHeaderType

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed_images'
ALLOWED_EXTENSIONS = {'xtf'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_xtf_file(file):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = str(uuid.uuid4()) + '.png'
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        
        # Read XTF file and process the data
        (fh, p) = xtf_read(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        # Function to plot the waterfall-view of sonar data
        def plot_waterfall_view(np_chan, upper_limit, title, ax):
            np_chan.clip(0, upper_limit - 1, out=np_chan)
            np_chan = np.log10(np_chan + 1, dtype=np.float32)
            np_chan = np_chan if np_chan.shape[0] < np_chan.shape[1] else np_chan.T
            ax.imshow(np_chan, cmap='gray', vmin=0, vmax=np.log10(upper_limit))
            ax.set_title(title)

        if XTFHeaderType.sonar in p:
            upper_limit = 2 ** 16
            np_chan1 = concatenate_channel(p[XTFHeaderType.sonar], file_header=fh, channel=0, weighted=True)
            np_chan2 = concatenate_channel(p[XTFHeaderType.sonar], file_header=fh, channel=1, weighted=True)

            # Create a single subplot with two columns
            fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 6))

            # Plot the port and starboard sonar data in the respective subplots
            plot_waterfall_view(np_chan1, upper_limit, title='Port Sonar Data', ax=ax1)
            plot_waterfall_view(np_chan2, upper_limit, title='Starboard Sonar Data', ax=ax2)

            fig.tight_layout()

            # Save the processed image as PNG
            processed_image_filename = unique_filename
            processed_image_filepath = os.path.join(PROCESSED_FOLDER, processed_image_filename)
            plt.savefig(processed_image_filepath)
            plt.close()

            print("Image processing successful. Image URL:", processed_image_filename)

            # Get the full URL of the processed image
            processed_image_url = url_for('processed_image', filename=processed_image_filename, _external=True)

            return {'imageURL': processed_image_url}
        else:
            return None
    else:
        return None

@app.route('/api/process_xtf', methods=['POST'])
def process_xtf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    result = process_xtf_file(file)
    if result and 'imageURL' in result:
        return jsonify(result), 200
    else:
        return jsonify({'error': 'Invalid file format'}), 400

@app.route('/processed_images/<filename>')
def processed_image(filename):
    return send_from_directory(PROCESSED_FOLDER, filename)



if __name__ == '__main__':
    app.run(debug=True)
