using Microsoft.AspNetCore.Mvc;

namespace WebApplication1.Controllers
{
    public class LoginController : Controller
    {
        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Index(string Username, string Password)
        {
            if (IsValidUser(Username, Password))
            {
                return RedirectToAction("LoginSuccess");
            }
            else
            {
                ViewData["ErrorMessage"] = "Invalid username or password.";
                return View();
            }
        }

        public IActionResult LoginSuccess()
        {
            return View("LoginLoading");
        }

        private bool IsValidUser(string username, string password)
        {
            // Dummy authentication logic (Replace with DB check)
            return username == "admin" && password == "password123";
        }


    }
}
