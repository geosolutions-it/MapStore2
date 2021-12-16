import requests
import json

# Test Functions - One for every kind of test needed

# Common Functions
# Perform a GET request to the endpoint
def endpointrequest(url,headers,payload):
  endpointresponse = requests.request("GET", url, headers=headers, data=payload)
  return endpointresponse


# Anonymous User - Home Page Test (Multiple URL checks)
def homepagetest(baseurl):
  
  # Test result Dictionary
  testresults = {}

  # List of Maps Test
  listMapUrl = baseurl + "/mapstore/rest/geostore/extjs/search/category/MAP/***/thumbnail,details,featured?start=0&limit=12&includeAttributes=true"
  mapResult = endpointrequest(listMapUrl,{'Content-Type': 'application/json'},"{\"query\":\"\",\"variables\":{}}")
  testresults["MAPS"] = mapResult

  # List of DashBoards Test
  listDashboardUrl = baseurl + "/mapstore/rest/geostore/extjs/search/category/DASHBOARD/***/thumbnail,details,featured?start=0&limit=12"
  dashboardResult = endpointrequest(listDashboardUrl,{},{})
  testresults["DASHBOARDS"] = dashboardResult

  # List of GeoStories Test
  listGeoStoryUrl = baseurl + "/mapstore/rest/geostore/extjs/search/category/GEOSTORY/***/thumbnail,details,featured?start=0&limit=12"
  geostoryResult = endpointrequest(listGeoStoryUrl,{},{})
  testresults["GEOSTORYS"] = geostoryResult

  # List of Contexts Test
  listContextUrl = url = baseurl + "/mapstore/rest/geostore/extjs/search/category/CONTEXT/***/thumbnail,details,featured?start=0&limit=12"
  contextResult = endpointrequest(listContextUrl,{},{})
  testresults["CONTEXTS"] = contextResult

  return testresults
###

# Anonymous User - Individual Map Test
def maptest(baseurl,map_id):
  
  # Test result Dictionary
  testresults = {}

  IndvMapUrl = baseurl + "/mapstore/rest/geostore/data/" + str(map_id)
  mapResult = endpointrequest(IndvMapUrl,{},{})
  testresults["INDMAP"] = mapResult

  return testresults
###

# Anonymous User - Individual Dashboard Test
def dashboardtest(baseurl,dashboard_id):
  
  # Test result Dictionary
  testresults = {}

  IndvDashBoardUrl = baseurl + "/mapstore/rest/geostore/data/" + str(dashboard_id)
  dashboardResult = endpointrequest(IndvDashBoardUrl,{},{})
  testresults["INDDASHBOARD"] = dashboardResult

  return testresults
###

# Anonymous User - Individual Geostory Test
def geostorytest(baseurl,geostory_id):
  
  # Test result Dictionary
  testresults = {}

  IndvGeostoryUrl = baseurl + "/mapstore/rest/geostore/data/" + str(geostory_id)
  geostoryResult = endpointrequest(IndvGeostoryUrl,{},{})
  testresults["INDGEOSTORY"] = geostoryResult

  return testresults
###

# Anonymous User - Thumbnail Test
def thumbnailtest(baseurl):
  
  # Test result Dictionary
  testresults = {}

  return testresults
###

# Anonymous User - Datadir Externalization Test
def datadirtest(baseurl):
  
  # Test result Dictionary
  testresults = {}

  return testresults
###

#'''
# Main URL of the MapStore environment
envurl = "https://mapstore.geosolutionsgroup.com"

hpTestResults = homepagetest(envurl)

# map_id = 8129
# dashboard_id = 8363
# geostory_id = 8355

#typetst = "MAPS"           
#typetst = "DASHBOARDS"
#typetst = "GEOSTORYS"       
#typetst = "CONTEXTS"        

#typetst = "INDMAP"
#typetst = "INDDASHBOARD"
#typetst = "INDGEOSTORY" 


tstprint = hpTestResults[typetst].json()

print(hpTestResults[typetst].text)
print(tstprint['success'])
print(hpTestResults[typetst].status_code)
#'''


'''
url = "https://mapstore.geosolutionsgroup.com/mapstore/rest/geostore/data/8129"
payload={}
headers = {}
response = requests.request("GET", url, headers=headers, data=payload)


a = response.json()
print(response.text)
print(a['success'])
print(response.status_code)

'''