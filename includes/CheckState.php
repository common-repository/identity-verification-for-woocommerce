<?php
namespace RealID;

use Finite\StatefulInterface;
use Finite\State\StateInterface;
use Finite\StateMachine\StateMachine;
use Finite\Loader\ArrayLoader;

class CheckState implements StatefulInterface
{
    private $state;
    public $stateMachine;

    public function __construct($state) {
      $this->state = $state;
      
      $loader = new ArrayLoader([
          'class'   => 'RealID\\CheckState',
          'states'  => [
              'delivered' => [
                  'type'       => StateInterface::TYPE_INITIAL,
                  'properties' => [],
              ],
              'opened' => [
                  'type'       => StateInterface::TYPE_NORMAL,
                  'properties' => [],
              ],
              'id' => [
                  'type'       => StateInterface::TYPE_NORMAL,
                  'properties' => [],
              ],
              'submitted-id' => [
                  'type'       => StateInterface::TYPE_NORMAL,
                  'properties' => [],
              ],
              'face_match' => [
                  'type'      => StateInterface::TYPE_NORMAL,
                  'properties'=> [],
              ],
              'in_review' => [
                  'type'      => StateInterface::TYPE_NORMAL,
                  'properties'=> [],
              ],
              'completed' => [
                  'type'       => StateInterface::TYPE_FINAL,
                  'properties' => [],
              ],
              'failed' => [
                  'type'       => StateInterface::TYPE_FINAL,
                  'properties' => [],
              ],
              'manually_approved' => [
                  'type'       => StateInterface::TYPE_FINAL,
                  'properties' => [],
              ],
              'manually_rejected' => [
                  'type'       => StateInterface::TYPE_FINAL,
                  'properties' => [],
              ],
          ],
          'transitions' => [
              'opened' => ['from' => ['delivered'], 'to' => 'opened'],
              'id' => ['from' => ['delivered', 'opened'], 'to' => 'id'],
              'face_match' => ['from' => ['delivered', 'opened', 'id'], 'to' => 'face_match'],
              'in_review' => ['from' => ['delivered', 'opened', 'id', 'face_match'], 'to' => 'in_review'],
              'completed'  => ['from' => ['delivered', 'opened', 'id', 'face_match', 'completed', 'submitted-id'], 'to' => 'completed'],
              'failed'  => ['from' => ['delivered', 'opened', 'id', 'face_match', 'completed', 'submitted-id'], 'to' => 'failed'],
              'manually_approved'  => ['from' => ['delivered', 'opened', 'id', 'face_match', 'in_review', 'completed', 'failed', 'manually_rejected', ], 'to' => 'manually_approved'],
              'manually_rejected'  => ['from' => ['delivered', 'opened', 'id', 'face_match', 'in_review', 'completed', 'failed', 'manually_approved', ], 'to' => 'manually_rejected'],
          ],
      ]);

      $stateMachine = new StateMachine($this);
      $loader->load($stateMachine);
      $stateMachine->initialize();

      $this->stateMachine = $stateMachine;

    }

    public function getFiniteState()
    {
        return $this->state;
    }

    public function setFiniteState($state)
    {
        $this->state = $state;
    }
}
