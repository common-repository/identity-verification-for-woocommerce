<?php

namespace RealID;

use RealID\Interfaces\Views;

/**
 * Abstraction over template engine
 * 
 */
class TemplateEngine implements Views {
  private $engine;

  public function __construct($engine) {
    $this->engine = $engine;
  }

  /**
   * Render the given template & set of data
   * Since this is WP, we'll just echo it directly
   * 
   * @param string $template The path to the template, starts in the includes/views directory
   * @param array $data The data to be shared with the template during rendering
   * @return void
   */
  public function render($template, $data) {
    echo $this->engine->render($template, $data);
  }
}
