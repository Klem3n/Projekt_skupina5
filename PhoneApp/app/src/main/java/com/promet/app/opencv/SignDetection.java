package com.promet.app.opencv;

import android.content.Context;
import android.net.Uri;

import com.promet.R;
import com.promet.app.activity.RoadCamera;

import org.opencv.core.Mat;
import org.opencv.core.MatOfByte;
import org.opencv.core.MatOfRect;
import org.opencv.core.Rect;
import org.opencv.core.Scalar;
import org.opencv.core.Size;
import org.opencv.imgproc.Imgproc;
import org.opencv.objdetect.CascadeClassifier;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;

public class SignDetection {
    MatOfByte mem = new MatOfByte();
    CascadeClassifier faceDetector;
    MatOfRect signDetections = new MatOfRect();

    public SignDetection(RoadCamera camera) throws IOException {
        InputStream is = camera.getResources().openRawResource(R.raw.cascade_full);
        File cascadeDir = camera.getDir("cascade", Context.MODE_PRIVATE);
        File mCascadeFile = new File(cascadeDir, "cascade_full.xml");
        FileOutputStream os = new FileOutputStream(mCascadeFile);

        byte[] buffer = new byte[4096];
        int bytesRead;
        while ((bytesRead = is.read(buffer)) != -1) {
            os.write(buffer, 0, bytesRead);
        }
        is.close();
        os.close();

        faceDetector = new CascadeClassifier(mCascadeFile.getAbsolutePath());
    }

    public void run(Mat cameraFrame){
        faceDetector
                .detectMultiScale(cameraFrame, signDetections, 1.1, 3, 0, new Size(20, 20), new Size());
        for (Rect rect : signDetections.toArray()) {
            Imgproc.rectangle(cameraFrame, rect.tl(), rect.br(), new Scalar(0, 255, 0));
        }
    }
}
