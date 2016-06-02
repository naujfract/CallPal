'use strict';

angular
  .module('callpal.nest.myinterest')
  .factory('MyInterestService', MyInterestService);

function MyInterestService($http, $q, UserSvc, $window, SettingsLanguageService, $translate) {

  var host = window.config.content.host;

  return {

    get_tabs: function () {

      SettingsLanguageService.get_lang().then(function(language){
          $translate.use(language);
      });

      var dfd = $q.defer();

      var interests = {
        name: 'My Interest',
        transalated_name: $translate.instant('w_nest.edit.my_interest'),
        search: 'interests',
        transalated_search: $translate.instant('w_nest.edit.search.my_interest'),
        animated: 'bounceInLeft',
        childs_class: '',
        childs: [
          {'name': 'computer & electronics',
           'translated': $translate.instant('w_nest.categories.computer_electronics.name'),
           'image': 'web-assets/img/nest/categories/computerelectronics.svg',
           'keywords': [
             {'key': 'Accessories', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.accessories'), 'title': 'Accessories'},
             {'key': 'Android', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.android'), 'title': 'Android'},
             {'key': 'Apple', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.apple'), 'title': 'Apple'},
             {'key': 'Apps', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.apps'), 'title': 'Apps'},
             {'key': 'Cameras', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.cameras'), 'title': 'Cameras'},
             {'key': 'Desktops', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.desktops'), 'title': 'Desktops'},
             {'key': 'Drones', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.drones'), 'title': 'Drones'},
             {'key': 'Gadgets', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.gadgets'), 'title': 'Gadgets'},
             {'key': 'Google', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.google'), 'title': 'Google'},
             {'key': 'GPS', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.gps'), 'title': 'GPS'},
             {'key': 'Hard Drives', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.hard_drives'), 'title': 'Hard Drives'},
             {'key': 'Hardware', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.hardware'), 'title': 'Hardware'},
             {'key': 'Headphones', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.headphones'), 'title': 'Headphones'},
             {'key': 'Laptops', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.laptops'), 'title': 'Laptops'},
             {'key': 'Monitors', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.monitors'), 'title': 'Monitors'},
             {'key': 'Phones', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.phones'), 'title': 'Phones'},
             {'key': 'Printers', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.printers'), 'title': 'Printers'},
             {'key': 'Processors', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.processors'), 'title': 'Processors'},
             {'key': 'Software', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.software'), 'title': 'Software'},
             {'key': 'Tablets', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.tablets'), 'title': 'Tablets'},
             {'key': "TVs", 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.tvs'), 'title': "TVs"},
             {'key': 'Virtualreality', 'translated': $translate.instant('w_nest.categories.computer_electronics.key_words.virtualreality'), 'title': 'Virtualreality'}
           ]},
          {'name': 'Technology',
           'translated': $translate.instant('w_nest.categories.technology.name'),
           'image': 'web-assets/img/nest/categories/technology.svg',
           'keywords': [
             {'key': 'Apple', 'translated': $translate.instant('w_nest.categories.technology.key_words.apple'), 'title': 'Apple'},
             {'key': 'Apps', 'translated': $translate.instant('w_nest.categories.technology.key_words.apps'), 'title': 'Apps'},
             {'key': 'ArtificialIntelligence', 'translated': $translate.instant('w_nest.categories.technology.key_words.artificial_intelligence'), 'title': 'ArtificialIntelligence'},
             {'key': 'Computers', 'translated': $translate.instant('w_nest.categories.technology.key_words.computers'), 'title': 'Computers'},
             {'key': 'Desktops', 'translated': $translate.instant('w_nest.categories.technology.key_words.desktops'), 'title': 'Desktops'},
             {'key': 'Drones', 'translated': $translate.instant('w_nest.categories.technology.key_words.drones'), 'title': 'Drones'},
             {'key': 'Gadgets', 'translated': $translate.instant('w_nest.categories.technology.key_words.gadgets'), 'title': 'Gadgets'},
             {'key': 'Google', 'translated': $translate.instant('w_nest.categories.technology.key_words.google'), 'title': 'Google'},
             {'key': 'Hoverboards', 'translated': $translate.instant('w_nest.categories.technology.key_words.hoverboards'), 'title': 'Hoverboards'},
             {'key': 'Laptops', 'translated': $translate.instant('w_nest.categories.technology.key_words.laptops'), 'title': 'Laptops'},
             {'key': 'Phones', 'translated': $translate.instant('w_nest.categories.technology.key_words.phones'), 'title': 'Phones'},
             {'key': 'Robots', 'translated': $translate.instant('w_nest.categories.technology.key_words.robots'), 'title': 'Robots'},
             {'key': 'SiliconValley', 'translated': $translate.instant('w_nest.categories.technology.key_words.silicon_valley'), 'title': 'SiliconValley'},
             {'key': 'Solar Power', 'translated': $translate.instant('w_nest.categories.technology.key_words.solar_power'), 'title': 'Solar Power'},
             {'key': 'Tablets', 'translated': $translate.instant('w_nest.categories.technology.key_words.tablets'), 'title': 'Tablets'},
             {'key': 'TechBlogs', 'translated': $translate.instant('w_nest.categories.technology.key_words.tech_blogs'), 'title': 'TechBlogs'},
             {'key': 'TechMagazines', 'translated': $translate.instant('w_nest.categories.technology.key_words.tech_magazines'), 'title': 'TechMagazines'},
             {'key': 'TechNews', 'translated': $translate.instant('w_nest.categories.technology.key_words.tech_news'), 'title': 'TechNews'},
             {'key': 'VirtualGlass', 'translated': $translate.instant('w_nest.categories.technology.key_words.virtual_glass'), 'title': 'VirtualGlass'},
             {'key': 'VirtualReality', 'translated': $translate.instant('w_nest.categories.technology.key_words.virtual_reality'), 'title': 'VirtualReality'},
             {'key': 'IT', 'translated': $translate.instant('w_nest.categories.technology.key_words.it'), 'title': 'IT'},
             {'key': 'Networking', 'translated': $translate.instant('w_nest.categories.technology.key_words.networking'), 'title': 'Networking'}
           ]},
          {'name': 'Education',
           'translated': $translate.instant('w_nest.categories.education.name'),
           'image': 'web-assets/img/nest/categories/education.svg',
           'keywords': [
             {'key': 'Books', 'translated': $translate.instant('w_nest.categories.education.key_words.books'), 'title': 'Books'},
             {'key': 'Colleges', 'translated': $translate.instant('w_nest.categories.education.key_words.colleges'), 'title': 'Colleges'},
             {'key': 'CommunityColleges', 'translated': $translate.instant('w_nest.categories.education.key_words.community_colleges'), 'title': 'CommunityColleges'},
             {'key': 'Degrees', 'translated': $translate.instant('w_nest.categories.education.key_words.degrees'), 'title': 'Degrees'},
             {'key': 'EducationalApps', 'translated': $translate.instant('w_nest.categories.education.key_words.educational_apps'), 'title': 'EducationalApps'},
             {'key': 'EducationalSoftware', 'translated': $translate.instant('w_nest.categories.education.key_words.educational_software'), 'title': 'EducationalSoftware'},
             {'key': 'ElementarySchools', 'translated': $translate.instant('w_nest.categories.education.key_words.elementary_schools'), 'title': 'ElementarySchools'},
             {'key': 'Highschools', 'translated': $translate.instant('w_nest.categories.education.key_words.high_schools'), 'title': 'Highschools'},
             {'key': 'HomeSchooling', 'translated': $translate.instant('w_nest.categories.education.key_words.home_schooling'), 'title': 'HomeSchooling'},
             {'key': 'IvyLeague', 'translated': $translate.instant('w_nest.categories.education.key_words.ivy_league'), 'title': 'IvyLeague'},
             {'key': 'Learning', 'translated': $translate.instant('w_nest.categories.education.key_words.learning'), 'title': 'Learning'},
             {'key': 'MiddleSchools', 'translated': $translate.instant('w_nest.categories.education.key_words.middle_schools'), 'title': 'MiddleSchools'},
             {'key': 'Schools', 'translated': $translate.instant('w_nest.categories.education.key_words.schools'), 'title': 'Schools'},
             {'key': 'Universities', 'translated': $translate.instant('w_nest.categories.education.key_words.universities'), 'title': 'Universities'}
           ]},
          {'name': 'Entertainment & TV',
           'translated': $translate.instant('w_nest.categories.entertainment_tv.name'),
           'image': 'web-assets/img/nest/categories/entertainmenttv.svg',
           'keywords': [
             {'key': 'Bollywood', 'translated': $translate.instant('w_nest.categories.entertainment_tv.key_words.bollywood'), 'title': 'Bollywood'},
             {'key': 'EntertainmentNews', 'translated': $translate.instant('w_nest.categories.entertainment_tv.key_words.entertainment_news'), 'title': 'EntertainmentNews'},
             {'key': 'Film', 'translated': $translate.instant('w_nest.categories.entertainment_tv.key_words.film'), 'title': 'Film'},
             {'key': 'Hollywood', 'translated': $translate.instant('w_nest.categories.entertainment_tv.key_words.hollywood'), 'title': 'Hollywood'},
             {'key': 'IndieFilms', 'translated': $translate.instant('w_nest.categories.entertainment_tv.key_words.indie_films'), 'title': 'IndieFilms'},
             {'key': 'InternationalFilms', 'translated': $translate.instant('w_nest.categories.entertainment_tv.key_words.international_films'), 'title': 'InternationalFilms'},
             {'key': 'Music', 'translated': $translate.instant('w_nest.categories.entertainment_tv.key_words.music'), 'title': 'Music'},
             {'key': 'Television', 'translated': $translate.instant('w_nest.categories.entertainment_tv.key_words.television'), 'title': 'Television'},
             {'key': 'Trailers', 'translated': $translate.instant('w_nest.categories.entertainment_tv.key_words.trailers'), 'title': 'Trailers'},
             {'key': 'TVSeries', 'translated': $translate.instant('w_nest.categories.entertainment_tv.key_words.tv_series'), 'title': 'TVSeries'},
             {'key': 'TVShows', 'translated': $translate.instant('w_nest.categories.entertainment_tv.key_words.tv_shows'), 'title': 'TVShows'}
           ]},
          {'name': 'Fashion & Style',
           'translated': $translate.instant('w_nest.categories.fashion_style.name'),
           'image': 'web-assets/img/nest/categories/fashionstyle.svg',
           'keywords': [
             {'key': 'Activeswear', 'translated': $translate.instant('w_nest.categories.fashion_style.key_words.activeswear'), 'title': 'Activeswear'},
             {'key': 'Beauty', 'translated': $translate.instant('w_nest.categories.fashion_style.key_words.beauty'), 'title': 'Beauty'},
             {'key': 'FashionAccessories', 'translated': $translate.instant('w_nest.categories.fashion_style.key_words.fashion_accessories'), 'title': 'FashionAccessories'},
             {'key': 'FashionMagazines', 'translated': $translate.instant('w_nest.categories.fashion_style.key_words.fashion_magazines'), 'title': 'FashionMagazines'},
             {'key': 'FashionNews', 'translated': $translate.instant('w_nest.categories.fashion_style.key_words.fashion_news'), 'title': 'FashionNews'},
             {'key': 'FashionWeek', 'translated': $translate.instant('w_nest.categories.fashion_style.key_words.fashion_week'), 'title': 'FashionWeek'},
             {'key': 'Footwear', 'translated': $translate.instant('w_nest.categories.fashion_style.key_words.footwear'), 'title': 'Footwear'},
             {'key': 'Glamour', 'translated': $translate.instant('w_nest.categories.fashion_style.key_words.glamour'), 'title': 'Glamour'},
             {'key': 'Handbags', 'translated': $translate.instant('w_nest.categories.fashion_style.key_words.handbags'), 'title': 'Handbags'},
             {'key': 'Makeup', 'translated': $translate.instant('w_nest.categories.fashion_style.key_words.makeup'), 'title': 'Makeup'},
             {'key': "MensFashion", 'translated': $translate.instant('w_nest.categories.fashion_style.key_words.mens_fashion'), 'title': "MensFashion"},
             {'key': 'Outerwear', 'translated': $translate.instant('w_nest.categories.fashion_style.key_words.outerwear'), 'title': 'Outerwear'},
             {'key': 'Runway', 'translated': $translate.instant('w_nest.categories.fashion_style.key_words.runway'), 'title': 'Runway'},
             {'key': 'Shoes', 'translated': $translate.instant('w_nest.categories.fashion_style.key_words.shoes'), 'title': 'Shoes'},
             {'key': 'Swimwear', 'translated': $translate.instant('w_nest.categories.fashion_style.key_words.swimwear'), 'title': 'Swimwear'},
             {'key': 'Trending', 'translated': $translate.instant('w_nest.categories.fashion_style.key_words.trending'), 'title': 'Trending'},
             {'key': 'Underwear', 'translated': $translate.instant('w_nest.categories.fashion_style.key_words.underwear'), 'title': 'Underwear'},
             {'key': 'Urbanwear', 'translated': $translate.instant('w_nest.categories.fashion_style.key_words.urbanwear'), 'title': 'Urbanwear'},
             {'key': "WomensFashion", 'translated': $translate.instant('w_nest.categories.fashion_style.key_words.womens_fashion'), 'title': "WomensFashion"}
           ]},
          {'name': 'Health & Fitness',
           'translated': $translate.instant('w_nest.categories.health_fitness.name'),
           'image': 'web-assets/img/nest/categories/healthfitness.svg',
           'keywords': [
             {'key': 'Activewear', 'translated': $translate.instant('w_nest.categories.health_fitness.key_words.activewear'), 'title': 'Activewear'},
             {'key': 'CrossFit', 'translated': $translate.instant('w_nest.categories.health_fitness.key_words.cross_fit'), 'title': 'CrossFit'},
             {'key': 'Diets', 'translated': $translate.instant('w_nest.categories.health_fitness.key_words.diets'), 'title': 'Diets'},
             {'key': 'HealthSupplements', 'translated': $translate.instant('w_nest.categories.health_fitness.key_words.health_supplements'), 'title': 'HealthSupplements'},
             {'key': 'HealthyEating', 'translated': $translate.instant('w_nest.categories.health_fitness.key_words.healthy_eating'), 'title': 'HealthyEating'},
             {'key': 'HotYoga', 'translated': $translate.instant('w_nest.categories.health_fitness.key_words.hot_yoga'), 'title': 'HotYoga'},
             {'key': "MensHealth", 'translated': $translate.instant('w_nest.categories.health_fitness.key_words.mens_health'), 'title': "MensHealth"},
             {'key': 'Nutrition', 'translated': $translate.instant('w_nest.categories.health_fitness.key_words.nutrition'), 'title': 'Nutrition'},
             {'key': 'Running', 'translated': $translate.instant('w_nest.categories.health_fitness.key_words.running'), 'title': 'Running'},
             {'key': 'Sports', 'translated': $translate.instant('w_nest.categories.health_fitness.key_words.sports'), 'title': 'Sports'},
             {'key': 'Vegan', 'translated': $translate.instant('w_nest.categories.health_fitness.key_words.vegan'), 'title': 'Vegan'},
             {'key': 'Vegetarian', 'translated': $translate.instant('w_nest.categories.health_fitness.key_words.vegetarian'), 'title': 'Vegetarian'},
             {'key': "WomensHealth", 'translated': $translate.instant('w_nest.categories.health_fitness.key_words.womens_health'), 'title': "Women's Health"},
             {'key': 'Workouts', 'translated': $translate.instant('w_nest.categories.health_fitness.key_words.workouts'), 'title': 'Workouts'},
             {'key': 'Yoga', 'translated': $translate.instant('w_nest.categories.health_fitness.key_words.yoga'), 'title': 'Yoga'},
             {'key': 'Juicing', 'translated': $translate.instant('w_nest.categories.health_fitness.key_words.juicing'), 'title': 'Juicing'}
           ]},
          {'name': 'Historical',
           'translated': $translate.instant('w_nest.categories.historical.name'),
           'image': 'web-assets/img/nest/categories/historical.svg',
           'keywords': [
            {'key': 'FamousQuotes', 'translated': $translate.instant('w_nest.categories.historical.key_words.famous_quotes'), 'title': 'Famous Quotes'},
            {'key': 'FunFacts', 'translated': $translate.instant('w_nest.categories.historical.key_words.fun_facts'), 'title': 'Fun Facts'},
            {'key': 'History', 'translated': $translate.instant('w_nest.categories.historical.key_words.history'), 'title': 'History'},
            {'key': 'MemorableDates', 'translated': $translate.instant('w_nest.categories.historical.key_words.memorable_dates'), 'title': 'Memorable Dates'},
            {'key': 'UnsolvedMisteries', 'translated': $translate.instant('w_nest.categories.historical.key_words.unsolved_misteries'), 'title': 'Unsolved Misteries'}
           ]},
          {'name': 'Travel & Culture',
           'translated': $translate.instant('w_nest.categories.travel_culture.name'),
           'image': 'web-assets/img/nest/categories/travelculture.svg',
           'keywords': [
            {'key': 'All Inclusives', 'translated': $translate.instant('w_nest.categories.travel_culture.key_words.all_inclusives'), 'title': 'All Inclusives'},
            {'key': 'Beaches', 'translated': $translate.instant('w_nest.categories.travel_culture.key_words.beaches'), 'title': 'Beaches'},
            {'key': 'Caribbean', 'translated': $translate.instant('w_nest.categories.travel_culture.key_words.caribbean'), 'title': 'Caribbean'},
            {'key': 'Country', 'translated': $translate.instant('w_nest.categories.travel_culture.key_words.country'), 'title': 'Country'},
            {'key': 'Cruises', 'translated': $translate.instant('w_nest.categories.travel_culture.key_words.cruises'), 'title': 'Cruises'},
            {'key': 'Destinations', 'translated': $translate.instant('w_nest.categories.travel_culture.key_words.destinations'), 'title': 'Destinations'},
            {'key': 'Hotels', 'translated': $translate.instant('w_nest.categories.travel_culture.key_words.hotels'), 'title': 'Hotels'},
            {'key': 'Islands', 'translated': $translate.instant('w_nest.categories.travel_culture.key_words.islands'), 'title': 'Islands'},
            {'key': 'Lodging', 'translated': $translate.instant('w_nest.categories.travel_culture.key_words.lodging'), 'title': 'Lodging'},
            {'key': 'Luggage', 'translated': $translate.instant('w_nest.categories.travel_culture.key_words.luggage'), 'title': 'Luggage'},
            {'key': 'Paradise', 'translated': $translate.instant('w_nest.categories.travel_culture.key_words.paradise'), 'title': 'Paradise'},
            {'key': 'Resorts', 'translated': $translate.instant('w_nest.categories.travel_culture.key_words.resorts'), 'title': 'Resorts'},
            {'key': 'SummerVacations', 'translated': $translate.instant('w_nest.categories.travel_culture.key_words.summer_vacations'), 'title': 'Summer Vacation'},
            {'key': 'TravelAgents', 'translated': $translate.instant('w_nest.categories.travel_culture.key_words.travel_agents'), 'title': 'Travel Agents'},
            {'key': 'TravelNews', 'translated': $translate.instant('w_nest.categories.travel_culture.key_words.travel_news'), 'title': 'Travel News'},
            {'key': 'Vacation', 'translated': $translate.instant('w_nest.categories.travel_culture.key_words.vacation'), 'title': 'Vacation'},
            {'key': 'WinterGetaways', 'translated': $translate.instant('w_nest.categories.travel_culture.key_words.winter_getaways'), 'title': 'Winter Getaways'},
            {'key': 'TravelDeals', 'translated': $translate.instant('w_nest.categories.travel_culture.key_words.travel_deals'), 'title': 'Travel Deals'},
            {'key': 'Flights', 'translated': $translate.instant('w_nest.categories.travel_culture.key_words.flights'), 'title': 'Flights'},
            {'key': 'PrivateTravel', 'translated': $translate.instant('w_nest.categories.travel_culture.key_words.private_travel'), 'title': 'Private Travel'}
           ]},
          {'name': 'hobbies',
           'translated': $translate.instant('w_nest.categories.hobbies.name'),
           'image': 'web-assets/img/nest/categories/hobbies.svg',
           'keywords': [
            {'key': 'Baking', 'title': 'Baking'},
            {'key': 'Biking', 'title': 'Biking'},
            {'key': 'Bird Watching', 'title': 'BirdWatching'},
            {'key': 'Cooking', 'title': 'Cooking'},
            {'key': 'Crafts', 'title': 'Crafts'},
            {'key': 'Drawing', 'title': 'Drawing'},
            {'key': 'Drones', 'title': 'Drones'},
            {'key': 'Painting', 'title': 'Painting'},
            {'key': 'Reading', 'title': 'Reading'},
            {'key': 'Snorkeling', 'title': 'Snorkeling'},
            {'key': 'Toys', 'title': 'Toys'},
            {'key': 'Writing', 'title': 'Writing'}
           ]},
          {'name': 'arts & craft',
           'translated': $translate.instant('w_nest.categories.arts_craft.name'),
           'image': 'web-assets/img/nest/categories/artscraft.svg',
           'keywords': [
            {'key': 'Airbrushing', 'title': 'Airbrushing'},
            {'key': 'ArtSupplies', 'title': 'Art Supplies'},
            {'key': 'Books', 'title': 'Books'},
            {'key': 'Carving', 'title': 'Carving'},
            {'key': 'Charcoal', 'title': 'Charcoal'},
            {'key': 'Drawing', 'title': 'Drawing'},
            {'key': 'Galleries', 'title': 'Galleries'},
            {'key': 'Magazines', 'title': 'Magazines'},
            {'key': 'Oil Paint', 'title': 'Oil Paint'},
            {'key': 'Painting', 'title': 'Painting'},
            {'key': 'Photography', 'title': 'Photography'},
            {'key': 'Pottery', 'title': 'Pottery'},
            {'key': 'Scrapbooking', 'title': 'Scrapbooking'},
            {'key': 'Sculpting', 'title': 'Sculpting'},
            {'key': 'Watercolor', 'title': 'Watercolor'}
           ]},
          {'name': 'gaming',
           'translated': $translate.instant('w_nest.categories.gaming.name'),
           'image': 'web-assets/img/nest/categories/gaming.svg',
           'keywords': [
             {'key': 'Consoles', 'title': 'Consoles'},
             {'key': 'FPS', 'title': 'FPS'},
             {'key': 'Games', 'title': 'Games'},
             {'key': 'Nintendo', 'title': 'Nintendo'},
             {'key': 'PlayStation', 'title': 'PlayStation'},
             {'key': 'RPG', 'title': 'RPG'},
             {'key': 'Simulators', 'title': 'Simulators'},
             {'key': 'SportsGames', 'title': 'Sports Games'},
             {'key': 'Wii', 'title': 'Wii'},
             {'key': 'Xbox', 'title': 'Xbox'}
           ]},
          {'name': 'yachts & boats',
           'translated': $translate.instant('w_nest.categories.yachts_boats.name'),
           'image': 'web-assets/img/nest/categories/yachtsboats.svg',
           'keywords': [
            {'key': 'Bayliner', 'title': 'Bayliner'},
            {'key': 'BoatMagazines', 'title': 'Boat Magazines'},
            {'key': 'BoatNews', 'title': 'Boat News'},
            {'key': 'BoatShows', 'title': 'Boat Shows'},
            {'key': 'Charters', 'title': 'Charters'},
            {'key': 'FishingBoats', 'title': 'Fishing Boats'},
            {'key': 'LuxuryBoats', 'title': 'Luxury Boats'},
            {'key': 'MotoBoats', 'title': 'Motor Boats'},
            {'key': 'PowrBoats', 'title': 'Power Boats'},
            {'key': 'SailBoats', 'title': 'SailBoats'},
            {'key': 'Ships', 'title': 'Ships'},
            {'key': 'SpeedBoats', 'title': 'Speed Boats'},
            {'key': 'Yachts', 'title': 'Yachts'},
           ]},
          {'name': 'aviation',
           'translated': $translate.instant('w_nest.categories.aviation.name'),
           'image': 'web-assets/img/nest/categories/aviation.svg',
           'keywords': [
            {'key': 'Aircrafts', 'title': 'Aircrafts'},
            {'key': 'Airlines', 'title': 'Airlines'},
            {'key': 'AviationGear', 'title': 'Aviation Gear'},
            {'key': 'AviationMagazines', 'title': 'Aviation Magazines'},
            {'key': 'AviationNews', 'title': 'Aviation News'},
            {'key': 'AviationTechnology', 'title': 'Aviation Technology'},
            {'key': 'Biplanes', 'title': 'Biplanes'},
            {'key': 'Deals', 'title': 'Deals'},
            {'key': 'Fares', 'title': 'Fares'},
            {'key': 'Jets', 'title': 'Jets'},
            {'key': 'MilitaryPlanes', 'title': 'Military Planes'},
            {'key': 'Monoplanes', 'title': 'Monoplanes'},
            {'key': 'Seaplanes', 'title': 'Seaplanes'},
           ]},
          {'name': 'film & movies',
           'translated': $translate.instant('w_nest.categories.film_movies.name'),
           'image': 'web-assets/img/nest/categories/filmmovies.svg',
           'keywords': [
            {'key': 'Actors', 'title': 'Actors'},
            {'key': 'BlockBusters', 'title': 'BlockBusters'},
            {'key': 'Bollywood', 'title': 'Bollywood'},
            {'key': 'BoxOffice', 'title': 'Box Office'},
            {'key': 'Directors', 'title': 'Directors'},
            {'key': 'Film', 'title': 'Film'},
            {'key': 'FilmEquipment', 'title': 'Film Equipment'},
            {'key': 'FilmMagazine', 'title': 'Film Magazines'},
            {'key': 'FilmNews', 'title': 'Film News'},
            {'key': 'FilmRecords', 'title': 'Film Records'},
            {'key': 'FilmScore', 'title': 'Film Score'},
            {'key': 'FilmTechnology', 'title': 'Film Technology'},
            {'key': 'Hollywood', 'title': 'Hollywood'},
            {'key': 'Imax', 'title': 'Imax'},
            {'key': 'IndieFilms', 'title': 'Indie Films'},
            {'key': 'InternationalFilm', 'title': 'International Film'},
            {'key': 'LowBudgetFilms', 'title': 'Low Budget Films'},
            {'key': 'PostProduction', 'title': 'Post Production'},
            {'key': 'Theaters', 'title': 'Theaters'},
            {'key': 'Trailers', 'title': 'Trailers'},
            {'key': 'TVSeries', 'title': 'TV Series'},
            {'key': 'TVShows', 'title': 'TV Shows'}
           ]},
          {'name': 'business & finance',
           'translated': $translate.instant('w_nest.categories.business_finance.name'),
           'image': 'web-assets/img/nest/categories/businessfinance.svg',
           'keywords': [
            {'key': '401K', 'title': '401K'},
            {'key': 'Banks', 'title': 'Banks'},
            {'key': 'Commerce', 'title': 'Commerce'},
            {'key': 'Credit', 'title': 'Credit'},
            {'key': 'Exchange', 'title': 'Exchange'},
            {'key': 'FinancialNews', 'title': 'Finance News'},
            {'key': 'Investment', 'title': 'Investment'},
            {'key': 'Pension', 'title': 'Pension'},
            {'key': 'Retirement', 'title': 'Retirement'},
            {'key': 'StockMarket', 'title': 'StockMarket'},
            {'key': 'Taxes', 'title': 'Taxes'},
            {'key': 'WallStreet', 'title': 'WallStreet'},
           ]},
          {'name': 'lifestyle',
           'translated': $translate.instant('w_nest.categories.lifestyle.name'),
           'image': 'web-assets/img/nest/categories/lifestyle.svg',
           'keywords': [
             {'key': 'Blogging', 'title': 'Blogging'},
             {'key': 'CoffeeCulture', 'title': 'CoffeeCulture'},
             {'key': 'Fashion', 'title': 'Fashion'},
             {'key': 'Hair&Makeup', 'title': 'Hair&Makeup'},
             {'key': 'Recreation', 'title': 'Recreation'},
             {'key': 'Travel', 'title': 'Travel'},
             {'key': 'Juicing', 'title': 'Juicing'},
           ]},
          {'name': 'music',
           'translated': $translate.instant('w_nest.categories.music.name'),
           'image': 'web-assets/img/nest/categories/music.svg',
           'keywords': [
             {'key': 'Alternative', 'title': 'Alternative'},
             {'key': 'Awards', 'title': 'Awards'},
             {'key': 'Billboard', 'title': 'Billboard'},
             {'key': 'Country', 'title': 'Country'},
             {'key': 'EDM', 'title': 'EDM'},
             {'key': 'HipHop', 'title': 'HipHop'},
             {'key': 'Jazz', 'title': 'Jazz'},
             {'key': 'Latin',},
             {'key': 'Musicians',},
             {'key': 'MusicNews'},
             {'key': 'MusicShows'},
             {'key': 'Pop'},
             {'key': 'R&B'},
             {'key': 'Rap'},
             {'key': 'Rock'},
             {'key': 'Top40'},
             {'key': 'Techno'},
             {'key': 'Artists'},
             {'key': 'EDM'},
             {'key': 'Reggaetón'},
             {'key': 'Reggae'},
             {'key': 'IndieRock'},
             {'key': 'Bluegrass'},
             {'key': 'ClassicalMusic'},
             {'key': 'DJs'},
           ]},
          {'name': 'science & nature',
           'translated': $translate.instant('w_nest.categories.science_nature.name'),
           'image': 'web-assets/img/nest/categories/sciencenature.svg',
           'keywords': [
             {'key': 'Birds'},
             {'key': 'DNA'},
              {'key': 'Flowers'},
              {'key': 'Health'},
              {'key': 'Medical'},
              {'key': 'NationalGeographic'},
              {'key': 'Nature'},
              {'key': 'Neurology'},
              {'key': 'OutdoorActivities'},
              {'key': 'Parks'},
              {'key': 'Photography'},
              {'key': 'Science'},
              {'key': 'Stars'},
              {'key': 'Therapies'},
              {'key': 'Wildlife'},
              {'key': 'Medicine'},
              {'key': 'Astrology'},
           ]},
          {'name': 'sports & recreation',
           'translated': $translate.instant('w_nest.categories.sports_recreation.name'),
           'image': 'web-assets/img/nest/categories/sportsrecreation.svg',
           'keywords': [
            { 'key': 'Baseball'},
            { 'key': 'Bowling '},
            { 'key': 'Cricket'},
            { 'key': 'Fishing'},
            { 'key': 'Hunting'},
            { 'key': 'NBA'},
            { 'key': 'NFL'},
            { 'key': 'NHL'},
            { 'key': 'Olympics'},
            { 'key': 'PGA'},
            { 'key': 'Polo'},
            { 'key': 'Racing'},
            { 'key': 'Rugby'},
            { 'key': 'Soccer'},
            { 'key': 'SummerSports'},
            { 'key': 'Superbowl'},
            { 'key': 'Tennis'},
            { 'key': 'UFC'},
            { 'key': 'WaterSports'},
            { 'key': 'WinterSports'},
            { 'key': 'WoldCup'},
           ]},
          {'name': 'real estate',
           'translated': $translate.instant('w_nest.categories.real_estate.name'),
           'image': 'web-assets/img/nest/categories/realestate.svg',
           'keywords': [
            { 'key': 'Association'},
            { 'key': 'Commercial'},
            { 'key': 'Community'},
            { 'key': 'Condos'},
            { 'key': 'Development'},
            { 'key': 'For Sale'},
            { 'key': 'GovernmentPrograms'},
            { 'key': 'HomeOwners'},
            { 'key': 'Homes'},
            { 'key': 'Housing'},
            { 'key': 'HousingRegulations'},
            { 'key': 'Inspections'},
            { 'key': 'LuxuryRealEstate'},
            { 'key': 'RealEstateMarket'},
            { 'key': 'Realtors'},
            { 'key': 'Residential'},
            { 'key': 'HousingMarket'},
            { 'key': 'Condos'},
            { 'key': 'Development'},
            { 'key': 'DowJonesRealEstate'},
           ]},
          {'name': 'antiques & collectables',
           'translated': $translate.instant('w_nest.categories.antiques_collectables.name'),
           'image': 'web-assets/img/nest/categories/antiquescollectables.svg',
           'keywords': [
            { 'key': 'Art'},
            { 'key': 'Artifacts'},
            { 'key': 'Auctions'},
            { 'key': 'Cars'},
            { 'key': 'Coins'},
            { 'key': 'Collectables'},
            { 'key': 'Film'},
            { 'key': 'Furniture'},
            { 'key': 'Paintings'},
            { 'key': 'Sculptures'},
            { 'key': 'Sports'},
            { 'key': 'Vintage'},
            { 'key': 'Watches'},
           ]},
          {'name': 'design',
           'translated': $translate.instant('w_nest.categories.design.name'),
           'image': 'web-assets/img/nest/categories/design.svg',
           'keywords': [
            { 'key': 'Architecture'},
            { 'key': 'Awards'},
            { 'key': 'Competitions'},
            { 'key': 'DesignBlogs'},
            { 'key': 'DesignMagazines'},
            { 'key': 'GraphicDesign'},
            { 'key': 'IndustrialDesing'},
            { 'key': 'InteriorDesign'},
            { 'key': 'ProductDesign'},
            { 'key': 'Trends'},
            { 'key': 'WebDesign'}
           ]},
          {'name': 'art & photography',
           'translated': $translate.instant('w_nest.categories.art_photography.name'),
           'image': 'web-assets/img/nest/categories/artphotography.svg',
           'keywords': [
            { 'key': 'Art Festivals'},
            { 'key': 'Art News'},
            { 'key': 'ArtDeco'},
            { 'key': 'Classics'},
            { 'key': 'cubism'},
            { 'key': 'dadaism'},
            { 'key': 'Exhibits'},
            { 'key': 'FashionPhotography'},
            { 'key': 'FineArt'},
            { 'key': 'futurism'},
            { 'key': 'Galleries'},
            { 'key': 'GlamourPhotography'},
            { 'key': 'Museums'},
            { 'key': 'NaturePhotography'},
            { 'key': 'Photographers'},
            { 'key': 'PopArt'},
            { 'key': 'Portraits'},
            { 'key': 'postmodern'},
            { 'key': 'Print'},
            { 'key': 'realism'},
            { 'key': 'romanticism'},
            { 'key': 'surrealism'},
            { 'key': 'symbolism'},
            { 'key': 'WeddingPhotography'}
           ]},
          {'name': 'auto & motorcycles',
           'translated': $translate.instant('w_nest.categories.auto_motorcycles.name'),
           'image': 'web-assets/img/nest/categories/automotorcycles.svg',
           'keywords': [
            { 'key': 'Auto'},
            { 'key': 'Auto Magazines'},
            { 'key': 'Auto Parts'},
            { 'key': 'Auto Shows'},
            { 'key': 'AutoTechnology'},
            { 'key': 'ElectricCars'},
            { 'key': 'Motorcycles'},
            { 'key': 'Racing'},
            { 'key': 'SportsCar'},
            { 'key': 'SUVs'},
            { 'key': 'Tesla'},
            { 'key': 'Trucks'}
           ]},
          {'name': 'celebrity & gossip',
           'translated': $translate.instant('w_nest.categories.celebrity_gossip.name'),
           'image': 'web-assets/img/nest/categories/celebritygossip.svg',
           'keywords': [
            { 'key': 'Awards'},
            { 'key': 'Celebrity News'},
            { 'key': 'Hollywood'},
            { 'key': 'Magazines'},
            { 'key': 'Moviestars'},
            { 'key': 'musicians'},
            { 'key': 'moviestars'},
            { 'key': 'Shows'},
            { 'key': 'Trending'}
           ]},
          {'name': 'comics & humor',
           'translated': $translate.instant('w_nest.categories.comics_humor.name'),
           'image': 'web-assets/img/nest/categories/comicshumor.svg',
           'keywords': [
            { 'key': 'Animation'},
            { 'key': 'Anime'},
            { 'key': 'Comedy'},
            { 'key': 'Comic Books'},
            { 'key': 'ComicStrips'},
            { 'key': 'Comiccon'},
            { 'key': 'DarkHorse'},
            { 'key': 'DCComics'},
            { 'key': 'Marvel'}
           ]},
          {'name': 'Beauty',
           'translated': $translate.instant('w_nest.categories.beauty.name'),
           'image': 'web-assets/img/nest/categories/beauty.svg',
           'keywords': [
            { 'key': 'Cosmetics'},
            { 'key': 'Deals'},
            { 'key': 'Hair'},
            { 'key': 'Makeup'},
            { 'key': 'SkinCare'},
            { 'key': 'Stores'},
            { 'key': 'Tutorials'}
           ]},
          {'name': 'Jewelry & watches',
           'translated': $translate.instant('w_nest.categories.jewelry_watches.name'),
           'image': 'web-assets/img/nest/categories/jewelrywatches.svg',
           'keywords': [
            { 'key': 'Bracelets'},
            { 'key': 'Cameos'},
            { 'key': 'Collectables'},
            { 'key': 'Diamonds'},
            { 'key': 'Earrings'},
            { 'key': 'Jewelry'},
            { 'key': "MensJewelry"},
            { 'key': "MensWatches"},
            { 'key': 'Necklaces'},
            { 'key': 'Piercing'},
            { 'key': 'Pins'},
            { 'key': 'Rings'},
            { 'key': 'Vintage'},
            { 'key': "WomensJewelry"},
            { 'key': "WomensWatches"},
           ]},
          {'name': 'Cooking & beverages',
           'translated': $translate.instant('w_nest.categories.cooking_beverages.name'),
           'image': 'web-assets/img/nest/categories/cookingbeverages.svg',
           'keywords': [
            { 'key': 'Beverages'},
            { 'key': 'Cocktails'},
            { 'key': 'Cooking'},
            { 'key': 'Cooking Shows'},
            { 'key': 'Deserts'},
            { 'key': 'RestaurantEquipment'},
            { 'key': 'EthnicFood'},
            { 'key': 'FineDining '},
            { 'key': 'HealthyFood'},
            { 'key': 'Ingredients'},
            { 'key': 'Kitchens'},
            { 'key': 'Magazines'},
            { 'key': 'Mixology'},
            { 'key': 'MolecularGastronomy'},
            { 'key': 'Recipes'},
            { 'key': 'Restaurants'},
            { 'key': 'Vegan'},
            { 'key': 'Vegetarian'},
            { 'key': 'Wines'},
            { 'key': 'RawEating'},
            { 'key': 'sushi'}
           ]},
          {'name': 'Adult',
          'translated': $translate.instant('w_nest.categories.adult.name'),
           'image': 'web-assets/img/nest/categories/adult.svg',
           'keywords': [
            { 'key': '401K'},
            { 'key': 'Car Insurance'},
            { 'key': 'Family Planning'},
            { 'key': 'Family Vacation'},
            { 'key': 'Health Insurance'},
            { 'key': 'Hospice Care'},
            { 'key': 'Investment'},
            { 'key': 'Life Insurance'},
            { 'key': 'Parenting'},
            { 'key': 'Retirement'},
            { 'key': 'RetirementHomes'}
           ]},
          {'name': 'International',
           'translated': $translate.instant('w_nest.categories.international.name'),
           'image': 'web-assets/img/nest/categories/international.svg', 'keywords': []},
          {'name': 'General Interest',
           'translated': $translate.instant('w_nest.categories.generalinterest.name'),
           'image': 'web-assets/img/nest/categories/generalinterest.svg', 'keywords': []},
          {'name': 'Bed & bath',
           'translated': $translate.instant('w_nest.categories.bedbath.name'),
           'image': 'web-assets/img/nest/categories/bedbath.svg',
           'keywords': [
            { 'key': 'Deals'},
            { 'key': 'Stores'},
            { 'key': 'Beds'},
            { 'key': 'Pillows'},
            { 'key': 'Bedroom'},
            { 'key': 'Bathroom'},
            { 'key': 'Shower'},
            { 'key': 'Cleaning'},
            { 'key': 'Mattresses'},
            { 'key': 'Soaps'},
            { 'key': 'Shampoos'},
            { 'key': 'OrganicProducts'},
            { 'key': 'NaturalProducts'},
            { 'key': 'Magazines'}
          ]}
        ]
      };

      var keywords = {
        name: 'Key Words',
        transalated_name: $translate.instant('w_nest.edit.key_words'),
        search: 'key words',
        transalated_search: $translate.instant('w_nest.edit.search.key_words'),
        animated: 'bounceInUp',
        childs_class: '',
        childs: [
        ]
      };

      var languages = {
        name: 'Languages',
        transalated_name: $translate.instant('w_nest.edit.languages'),
        animated: 'bounceInUp',
        search: 'languages',
        transalated_search: $translate.instant('w_nest.edit.search.languages'),
        childs_class: '',
        childs: [
          {'id': 1, 'title': 'English', 'code': 'en', 'flag': 'gb', 'type' : 'now'},
          {'id': 2, 'title': 'Español', 'code': 'es', 'flag': 'es', 'type' : 'now'},
          {'id': 3, 'title': 'Portuguese', 'code': 'pt', 'flag': 'pt', 'type' : 'now'},
          {'id': 4, 'title': 'Russian', 'code': 'ru', 'flag': 'ru', 'type' : 'now'},
          {'id': 5, 'title': 'French', 'code': 'fr', 'flag': 'fr', 'type' : 'now'},
          {'id': 6, 'title': 'Deutsche', 'code': 'de', 'flag': 'de', 'type' : 'now'},
          {'id': 7, 'title': 'Mandarin', 'code': 'cn', 'flag': 'cn', 'type' : 'coming'},
          {'id': 8, 'title': 'Hindi', 'code': 'in', 'flag': 'in', 'type' : 'coming'},
          {'id': 9, 'title': 'Arabic', 'code': 'sa', 'flag': 'sa', 'type' : 'coming'},
          {'id': 10, 'title': 'Hebrew', 'code': 'il', 'flag': 'il', 'type' : 'coming'},
          {'id': 10, 'title': 'Danish', 'code': 'dk', 'flag': 'dk', 'type' : 'coming'},
          {'id': 10, 'title': 'Greek', 'code': 'gr', 'flag': 'gr', 'type' : 'coming'},
          {'id': 10, 'title': 'Hungarian', 'code': 'hu', 'flag': 'hu', 'type' : 'coming'},
          {'id': 10, 'title': 'Japanese', 'code': 'jp', 'flag': 'jp', 'type' : 'coming'},
          {'id': 10, 'title': 'Korean', 'code': 'kr', 'flag': 'kr', 'type' : 'coming'},
          {'id': 10, 'title': 'Polish', 'code': 'pl', 'flag': 'pl', 'type' : 'coming'},
          {'id': 10, 'title': 'Romanian', 'code': 'ro', 'flag': 'ro', 'type' : 'coming'},
          {'id': 10, 'title': 'Thai', 'code': 'th', 'flag': 'th', 'type' : 'coming'},
          {'id': 10, 'title': 'Turkish', 'code': 'tr', 'flag': 'tr', 'type' : 'coming'},
        ]
      }

      var tabs = [];
      tabs.push(interests);
      tabs.push(keywords);
      tabs.push(languages);

      setTimeout(function() {
        dfd.resolve(tabs);
      }, 100);

      return dfd.promise;
    },

    send_interests: function(interests)
    {
      var userInfo = UserSvc.getUserInfo();
      var userToken = UserSvc.getUserToken();

      var req = {
        method: 'PUT',
        url: (host + '/myinterest/' + userInfo.username),
        headers: {
          'Authorization': 'Bearer ' + userToken.value,
          'Content-Type': 'application/json'
        },
        data: interests
      };

      var deferred = $q.defer();

      setTimeout(function () {

        $http(req)
            .then(function (response) {
                deferred.resolve(response);
            }, function (error) {
              deferred.reject(error);
            });

      }, 0);

      return deferred.promise;
    },

    get_interests: function()
    {
      var userInfo = UserSvc.getUserInfo();
      var userToken = UserSvc.getUserToken();

      var req = {
        method: 'GET',
        url: (host + '/myinterest/' + userInfo.username),
        headers: {
          'Authorization': 'Bearer ' + userToken.value,
          'Content-Type': 'application/json'
        }
      };

      var deferred = $q.defer();

      setTimeout(function () {

        $http(req)
            .then(function (response) {
                deferred.resolve(response.data);
            }, function (error) {
              deferred.reject(error);
            });

      }, 0);

      return deferred.promise;
    }

  };

}
