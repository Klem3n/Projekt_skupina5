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
import Alamofire
import SwiftyJSON

class ARViewController: UIViewController, CLLocationManagerDelegate, UNUserNotificationCenterDelegate {
    
    var sceneLocationView = SceneLocationView()
    var allAnnotationNodes = [LocationAnnotationNode]()
    var notificationCenter: UNUserNotificationCenter?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        print("did load ar view")
        
        makeNetworkRequest() { (jsonResult) -> () in
            print("network request callback here")
            self.setupAnnotationNodes(fetchedData: jsonResult)
            self.sceneLocationView.run()
            self.view.addSubview(self.sceneLocationView)
            self.sceneLocationView.addLocationNodesWithConfirmedLocation(locationNodes: self.allAnnotationNodes)
            self.setupGeofencing()
        }
        
        self.notificationCenter = UNUserNotificationCenter.current()
        
        notificationCenter?.delegate = self
        
        let options: UNAuthorizationOptions = [.alert, .sound]
        
        notificationCenter?.requestAuthorization(options: options) { (granted, error) in
            if !granted {
                print("Permission not granted")
            }
        }
    }
    
    func setupAnnotationNodes(fetchedData: JSON) {
        print("setupAnnotationNodes called")
        
        for element in fetchedData {
            
            let lat = element.1["latitude"].doubleValue
            let lon = element.1["longitude"].doubleValue
            
            let coordinate = CLLocationCoordinate2D(latitude: lat, longitude: lon)
            let location = CLLocation(coordinate: coordinate, altitude: 265)
            
            let annotation = UIImage(named: "police")!
            let annotationNode = LocationAnnotationNode(location: location, image: annotation)
            annotationNode.scaleRelativeToDistance = true
            annotationNode.scalingScheme = .normal
            annotationNode.continuallyUpdatePositionAndScale = true
            
            allAnnotationNodes.append(annotationNode)
        }
    }
    
    
    func makeNetworkRequest(completion: @escaping (JSON) -> ()) {
        // fetch current radar locations from server
        AF.request("http://192.168.1.127:5000/api/v1/fetch_all_radar").validate().responseJSON { response in
            if let data = response.data {
                let jsonData = try! JSON(data: data)
                completion(jsonData)
            }
        }
    }
    
    func setupGeofencing() {
        print("setup geofencing")
        
        let geofenceRegionCenter = CLLocationCoordinate2DMake(46.535370, 15.664380)
        let geofenceRegion = CLCircularRegion(center: geofenceRegionCenter, radius: 250, identifier: "UniqueIdentifier")
        
        geofenceRegion.notifyOnEntry = true
        geofenceRegion.notifyOnExit = true
        
        let appDelegate = UIApplication.shared.delegate as! AppDelegate
        appDelegate.locationManager?.delegate = self
        appDelegate.locationManager?.startUpdatingLocation()
        appDelegate.locationManager?.startMonitoring(for: geofenceRegion)
    }
    
    func locationManager(_ manager: CLLocationManager, didEnterRegion region: CLRegion) {
        if region is CLCircularRegion {
            // Do what you want if this information
            print("user entered defined region")
            print(region.description)
            self.handleEvent(forRegion: region)
        }
    }
        
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(true)
        
        let coordinate = CLLocationCoordinate2D(latitude: 46.534995, longitude: 15.664191)
        let location = CLLocation(coordinate: coordinate, altitude: 300)
        
        let label = UILabel(frame: CGRect(x: 0, y: 0, width: 200, height: 21))
        label.center = CGPoint(x: 160, y: 285)
        label.textAlignment = .center
        label.textColor = UIColor.red
        label.font = UIFont.boldSystemFont(ofSize: 100)
        label.text = "Radarska kontrola!"
        
        let annotation = UIImage(named: "police")!
        let annotationNode = LocationAnnotationNode(location: location, image: annotation)
        annotationNode.scaleRelativeToDistance = true
        annotationNode.scalingScheme = .normal
        annotationNode.continuallyUpdatePositionAndScale = true
        //sceneLocationView.addLocationNodeWithConfirmedLocation(locationNode: annotationNode)
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
    
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        // when app is open and in foreground
        completionHandler(.banner)
    }
    
    func handleEvent(forRegion region: CLRegion!) {
        
        // customize your notification content
        let content = UNMutableNotificationContent()
        content.title = "Nahajate se v območju radarske kontrole."
        content.body = "Nekdo je pred kratkim v tej okolici prijavil radarsko kontrolo. Previdno."
        content.sound = UNNotificationSound.default
        
        // the actual trigger object
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 5,
                                                        repeats: false)
        
        let identifier = UUID().uuidString
        
        // the notification request object
        let request = UNNotificationRequest(identifier: identifier,
                                            content: content,
                                            trigger: trigger)
        
        // trying to add the notification request to notification center
        notificationCenter?.add(request, withCompletionHandler: { (error) in
            if error != nil {
                print("Error adding notification with identifier: \(identifier)")
            }
        })
    }
}
