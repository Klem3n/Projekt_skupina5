//
//  ARViewController.swift
//  Projekt5-iOS
//
//  Created by Matic on 06/01/2021.
//

import ARCL
import ARKit
import MapKit
import SceneKit
import UIKit
import CoreLocation

class ARViewController: UIViewController {
    
    var sceneLocationView = SceneLocationView()
 
    override func viewDidLoad() {
        super.viewDidLoad()
        
        print("did load ar view")
        sceneLocationView.run()
        view.addSubview(sceneLocationView)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(true)
        
        let coordinate = CLLocationCoordinate2D(latitude: 46.534995, longitude: 15.664191)
        let location = CLLocation(coordinate: coordinate, altitude: 280)
        //let view = UIView() // or a custom UIView subclass
        
        let label = UILabel(frame: CGRect(x: 0, y: 0, width: 200, height: 21))
        label.center = CGPoint(x: 160, y: 285)
        label.textAlignment = .center
        label.textColor = UIColor.red
        label.font = UIFont.boldSystemFont(ofSize: 100)
        label.text = "Radarska kontrola!"
        //self.view.addSubview(label)
        
        let annotation = UIImage(named: "police")!
        let annotationNode = LocationAnnotationNode(location: location, image: annotation)
        annotationNode.scaleRelativeToDistance = true
        annotationNode.scalingScheme = .normal
        annotationNode.continuallyUpdatePositionAndScale = true
        sceneLocationView.addLocationNodeWithConfirmedLocation(locationNode: annotationNode)
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        
        sceneLocationView.frame = view.bounds
    }
    
    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(true)
        
        print("ar view dissapeared")
        
        sceneLocationView.stop(self)
    }
}
