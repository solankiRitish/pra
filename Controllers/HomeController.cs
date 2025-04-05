using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Models;


namespace WebApplication1.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Profile()
        {
            return View();
        }
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Register()
        {
            return View();
        }

        public IActionResult Weather()
        {
            return View();
        }

        public IActionResult Farmer()
        {
            return View();
        }

        public IActionResult Driver()
        {
            return View();
        }

        public IActionResult Seller()
        {
            return View();
        }

        public IActionResult Buyer()
        {
            return View();
        }

        public IActionResult Famer_Posts()
        {
            return View();
        }

        public IActionResult Driver_posts()
        {
            return View();
        }

        public IActionResult Seller_posts()
        {
            return View();
        }

        public IActionResult Buyer_posts()
        {
            return View();
        }

       


        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
